import { Session } from '@inrupt/solid-client-authn-browser';
import data from './seed.json';
import { uploadFile } from '@/api/utils';
import { setPublicAccess } from '@/api/access-control';
import { paths } from '@/api/paths';
import {
  buildThing,
  createSolidDataset,
  createThing,
  saveSolidDatasetAt,
  setThing,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { PERSONAL_DATA_SCHEMA } from '@/schemas/personal-data';
import { safeCall } from '@/utils';
import {
  FOOTBALL_AGGREGATION_SCHEMA,
  FOOTBALL_DATA_SCHEMA,
  SEASON_INFO_SCHEMA,
} from '@/schemas/football';
import { METADATA_SCHEMA } from '@/schemas/metadata';
import { EVENT_AGGREGATION_SCHEMA, EVENT_DATA_SCHEMA } from '@/schemas/event';
import { EventAggregation } from '@/entities/data/event-data';
import { TRACKING_DATA_SCHEMA } from '@/schemas/tracking-data';
import { BIOMETRIC_DATA_SCHEMA } from '@/schemas/biometric-data';

type TData = typeof data;
type TPersonal = TData['personal'];
type TSeason = TData['seasons'][0];
type TMatch = TSeason['club']['matches'][0];

let session: Session;
let pod: string;

export async function seedDb(_session: Session, _pod: string) {
  session = _session;
  pod = _pod;

  await Promise.all([
    await seedPersonalData(data.personal),
    data.seasons.map(seedSeason),
  ]);

  // Club aggregatinos
  await seedFootballAggregation(
    {
      matches: data.seasons.reduce(
        (acc, season) => acc + season.club.matches.length,
        0
      ),
      minutesPlayed: data.seasons.reduce(
        (acc, season) =>
          acc +
          season.club.matches.reduce((acc, match) => acc + match.playTime, 0),
        0
      ),
    },
    paths.footballData.club.aggregation(pod)
  );
  await seedEventAggregation(
    getEventAggregation(data.seasons.flatMap((season) => season.club.matches)),
    paths.eventData.club.aggregation(pod)
  );

  // Nation aggregation
  await seedFootballAggregation(
    {
      matches: data.seasons.reduce(
        (acc, season) => acc + season.nation.matches.length,
        0
      ),
      minutesPlayed: data.seasons.reduce(
        (acc, season) =>
          acc +
          season.nation.matches.reduce((acc, match) => acc + match.playTime, 0),
        0
      ),
    },
    paths.footballData.national.aggregation(pod)
  );
  await seedEventAggregation(
    getEventAggregation(
      data.seasons.flatMap((season) => season.nation.matches)
    ),
    paths.eventData.national.aggregation(pod)
  );
}

async function seedPersonalData(data: TPersonal) {
  console.log('Seeding personal data...');

  // Upload profile image
  const imageUrl = '/profile.jpg';
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const file = new File([blob], 'profile.jpg', { type: blob.type });
  await uploadFile(session, pod, paths.root(pod), file);

  // Make profile image public
  await setPublicAccess({
    session,
    url: `${paths.root(pod)}/profile.jpg`,
    modes: ['Read'],
  });

  // Create personal data
  let dataset = createSolidDataset();
  const thing = buildThing(createThing({ name: 'personal-data' }))
    .addUrl(RDF.type, PERSONAL_DATA_SCHEMA.type)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.name, data.name)
    .addStringNoLocale(
      PERSONAL_DATA_SCHEMA.image,
      `${paths.root(pod)}/profile.jpg`
    )
    .addDate(PERSONAL_DATA_SCHEMA.birthdate, new Date(data.birthdate))
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.address, data.address)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.phone, data.phone)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.email, data.email)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.nation, data.nation)
    .addInteger(PERSONAL_DATA_SCHEMA.height, data.height)
    .addInteger(PERSONAL_DATA_SCHEMA.weight, data.weight)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.dominantFoot, data.dominantFoot)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.position, data.position)
    .build();
  dataset = setThing(dataset, thing);
  await safeCall(
    saveSolidDatasetAt(paths.personalData(pod), dataset, {
      fetch: session.fetch,
    })
  );
}

async function seedSeason(season: TSeason) {
  console.log('Seeding data for season', season.year);

  // Seed club data
  await seedSeasonInfo(
    {
      season: season.year,
      team: season.club.team,
      league: season.club.league,
    },
    paths.footballData.club.season.info(pod, season.year)
  );
  const clubMinutesPlayed = season.club.matches.reduce(
    (acc, match) => acc + match.playTime,
    0
  );
  await seedFootballAggregation(
    { matches: season.club.matches.length, minutesPlayed: clubMinutesPlayed },
    paths.footballData.club.season.aggregation(pod, season.year)
  );
  await seedEventAggregation(
    getEventAggregation(season.club.matches),
    paths.eventData.club.season.aggregation(pod, season.year)
  );
  season.club.matches.map(async (match) => {
    await seedMatch(match, 'club', season.year);
  });

  // Seed nation data
  await seedSeasonInfo(
    {
      season: season.year,
      team: season.nation.team,
      league: season.nation.league,
    },
    paths.footballData.national.season.info(pod, season.year)
  );
  const nationMinutesPlayed = season.nation.matches.reduce(
    (acc, match) => acc + match.playTime,
    0
  );
  await seedFootballAggregation(
    {
      matches: season.nation.matches.length,
      minutesPlayed: nationMinutesPlayed,
    },
    paths.footballData.national.season.aggregation(pod, season.year)
  );
  await seedEventAggregation(
    getEventAggregation(season.nation.matches),
    paths.eventData.national.season.aggregation(pod, season.year)
  );
  season.nation.matches.map(async (match) => {
    await seedMatch(match, 'national', season.year);
  });
}

async function seedSeasonInfo(
  info: { season: string; team: string; league: string },
  path: string
) {
  let dataset = createSolidDataset();
  const thing = buildThing(createThing({ name: 'season-info' }))
    .addUrl(RDF.type, SEASON_INFO_SCHEMA.type)
    .addStringNoLocale(SEASON_INFO_SCHEMA.season, info.season)
    .addStringNoLocale(SEASON_INFO_SCHEMA.team, info.team)
    .addStringNoLocale(SEASON_INFO_SCHEMA.league, info.league)
    .build();
  dataset = setThing(dataset, thing);

  await saveSolidDatasetAt(path, dataset, {
    fetch: session.fetch,
  });
}

async function seedFootballAggregation(
  data: { matches: number; minutesPlayed: number },
  path: string
) {
  let dataset = createSolidDataset();
  const thing = buildThing(createThing({ name: 'aggregation' }))
    .addUrl(RDF.type, FOOTBALL_AGGREGATION_SCHEMA.type)
    .addInteger(FOOTBALL_AGGREGATION_SCHEMA.matches, data.matches)
    .addInteger(FOOTBALL_AGGREGATION_SCHEMA.minutesPlayed, data.minutesPlayed)
    .build();
  dataset = setThing(dataset, thing);

  await safeCall(
    saveSolidDatasetAt(path, dataset, {
      fetch: session.fetch,
    })
  );
}

async function seedEventAggregation(data: EventAggregation, path: string) {
  let dataset = createSolidDataset();
  const thing = buildThing(createThing({ name: 'aggregation' }))
    .addUrl(RDF.type, EVENT_AGGREGATION_SCHEMA.type)
    .addInteger(EVENT_AGGREGATION_SCHEMA.goals, data.goals)
    .addInteger(EVENT_AGGREGATION_SCHEMA.assists, data.assists)
    .addInteger(EVENT_AGGREGATION_SCHEMA.yellowCards, data.yellowCards)
    .addInteger(EVENT_AGGREGATION_SCHEMA.redCards, data.redCards)
    .addInteger(EVENT_AGGREGATION_SCHEMA.corners, data.corners)
    .addInteger(EVENT_AGGREGATION_SCHEMA.freeKicks, data.freeKicks)
    .addInteger(EVENT_AGGREGATION_SCHEMA.penalties, data.penalties)
    .addInteger(EVENT_AGGREGATION_SCHEMA.throwIns, data.throwIns)
    .addInteger(EVENT_AGGREGATION_SCHEMA.throphies, data.throphies)
    .build();
  dataset = setThing(dataset, thing);

  await safeCall(saveSolidDatasetAt(path, dataset, { fetch: session.fetch }));
}

async function seedMatch(
  match: TMatch,
  type: 'club' | 'national',
  season: string
) {
  const matchId = crypto.randomUUID();
  let dataset = createSolidDataset();
  const thing = buildThing(createThing({ name: matchId }))
    .addUrl(RDF.type, FOOTBALL_DATA_SCHEMA.type)
    .addStringNoLocale(FOOTBALL_DATA_SCHEMA.homeTeam, match.home)
    .addStringNoLocale(FOOTBALL_DATA_SCHEMA.awayTeam, match.away)
    .addInteger(FOOTBALL_DATA_SCHEMA.homeScore, match.homeScore)
    .addInteger(FOOTBALL_DATA_SCHEMA.awayScore, match.awayScore)
    .addDate(FOOTBALL_DATA_SCHEMA.date, new Date(match.date))
    .addStringNoLocale(FOOTBALL_DATA_SCHEMA.location, match.location)
    .addInteger(FOOTBALL_DATA_SCHEMA.playTime, match.playTime)
    .addStringNoLocale(FOOTBALL_DATA_SCHEMA.position, match.position)
    .build();
  dataset = setThing(dataset, thing);

  const category =
    type === 'club' ? paths.footballData.club : paths.footballData.national;

  await safeCall(
    saveSolidDatasetAt(category.season.match(pod, season, matchId), dataset, {
      fetch: session.fetch,
    })
  );

  await seedEventsForMatch(match, matchId, type, season);
  await seedTrackingForMatch(match, matchId, type, season);
  await seedBiometricDataForMatch(match, matchId, type, season);
}

async function seedEventsForMatch(
  match: TMatch,
  matchId: string,
  type: 'club' | 'national',
  season: string
) {
  const footballCategory =
    type === 'club' ? paths.footballData.club : paths.footballData.national;
  const eventCategory =
    type === 'club' ? paths.eventData.club : paths.eventData.national;

  let dataset = createSolidDataset();
  const metadata = buildThing(createThing({ name: 'metadata' }))
    .addUrl(RDF.type, METADATA_SCHEMA.type)
    .addStringNoLocale(
      METADATA_SCHEMA.match,
      footballCategory.season.match(pod, season, matchId)
    )
    .build();
  dataset = setThing(dataset, metadata);

  match.events.forEach((event) => {
    const eventId = crypto.randomUUID();
    const thing = buildThing(createThing({ name: eventId }))
      .addUrl(RDF.type, EVENT_DATA_SCHEMA.type)
      .addStringNoLocale(EVENT_DATA_SCHEMA.event, event.event)
      .addStringNoLocale(EVENT_DATA_SCHEMA.time, event.time)
      .addStringNoLocale(EVENT_DATA_SCHEMA.notes, event.notes)
      .build();
    dataset = setThing(dataset, thing);
  });

  await safeCall(
    saveSolidDatasetAt(
      eventCategory.season.match(pod, season, matchId),
      dataset,
      { fetch: session.fetch }
    )
  );
}

async function seedTrackingForMatch(
  match: TMatch,
  matchId: string,
  type: 'club' | 'national',
  season: string
) {
  const footballCategory =
    type === 'club' ? paths.footballData.club : paths.footballData.national;

  let dataset = createSolidDataset();
  const metadata = buildThing(createThing({ name: 'metadata' }))
    .addUrl(RDF.type, METADATA_SCHEMA.type)
    .addStringNoLocale(
      METADATA_SCHEMA.match,
      footballCategory.season.match(pod, season, matchId)
    )
    .build();
  dataset = setThing(dataset, metadata);

  match.tracking.forEach((tracking) => {
    const trackingId = crypto.randomUUID();
    const thing = buildThing(createThing({ name: trackingId }))
      .addUrl(RDF.type, TRACKING_DATA_SCHEMA.type)
      .addStringNoLocale(
        TRACKING_DATA_SCHEMA.coordinates,
        `${tracking.coordinations.x}, ${tracking.coordinations.y}, ${tracking.coordinations.z}`
      )
      .addInteger(TRACKING_DATA_SCHEMA.speed, tracking.speed)
      .addStringNoLocale(TRACKING_DATA_SCHEMA.time, tracking.timestamp)
      .build();
    dataset = setThing(dataset, thing);
  });

  await safeCall(
    saveSolidDatasetAt(
      paths.trackingData.matches.match(pod, season, matchId),
      dataset,
      { fetch: session.fetch }
    )
  );
}

async function seedBiometricDataForMatch(
  match: TMatch,
  matchId: string,
  type: 'club' | 'national',
  season: string
) {
  const footballCategory =
    type === 'club' ? paths.footballData.club : paths.footballData.national;

  let dataset = createSolidDataset();
  const metadata = buildThing(createThing({ name: 'metadata' }))
    .addUrl(RDF.type, METADATA_SCHEMA.type)
    .addStringNoLocale(
      METADATA_SCHEMA.match,
      footballCategory.season.match(pod, season, matchId)
    )
    .build();
  dataset = setThing(dataset, metadata);

  match.biometric.forEach((data) => {
    const trackingId = crypto.randomUUID();
    const thing = buildThing(createThing({ name: trackingId }))
      .addUrl(RDF.type, BIOMETRIC_DATA_SCHEMA.type)
      .addStringNoLocale(BIOMETRIC_DATA_SCHEMA.label, data.type)
      .addStringNoLocale(BIOMETRIC_DATA_SCHEMA.value, `${data.value}`)
      .addStringNoLocale(BIOMETRIC_DATA_SCHEMA.time, data.timestamp)
      .build();
    dataset = setThing(dataset, thing);
  });

  await safeCall(
    saveSolidDatasetAt(
      paths.biometricData.matches.match(pod, season, matchId),
      dataset,
      { fetch: session.fetch }
    )
  );
}

function getEventAggregation(matches: TMatch[]) {
  const eventTotals: EventAggregation = {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    freeKicks: 0,
    penalties: 0,
    throwIns: 0,
    throphies: 0,
  };
  matches.forEach((match) => {
    match.events.forEach((event) => {
      switch (event.event) {
        case 'Goal':
          eventTotals.goals++;
          break;
        case 'Assist':
          eventTotals.assists++;
          break;
        case 'Yellow Card':
          eventTotals.yellowCards++;
          break;
        case 'Red Card':
          eventTotals.redCards++;
          break;
        case 'Corner':
          eventTotals.corners++;
          break;
        case 'Free Kick':
          eventTotals.freeKicks++;
          break;
        case 'Penalty':
          eventTotals.penalties++;
          break;
        case 'Throw In':
          eventTotals.throwIns++;
          break;
      }
    });
  });
  return eventTotals;
}
