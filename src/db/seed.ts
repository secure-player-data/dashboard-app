import { Session } from '@inrupt/solid-client-authn-browser';
import data from './seed.json';
import {
  buildThing,
  createContainerAt,
  createSolidDataset,
  createThing,
  saveSolidDatasetAt,
  setThing,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { PERSONAL_DATA_SCHEMA } from '@/schemas/personal-data';
import { paths } from '@/api/paths';
import { safeCall } from '@/utils';
import {
  FOOTBALL_AGGREGATION_SCHEMA,
  FOOTBALL_DATA_SCHEMA,
} from '@/schemas/football';
import { EVENT_AGGREGATION_SCHEMA, EVENT_DATA_SCHEMA } from '@/schemas/event';
import { TRACKING_DATA_SCHEMA } from '@/schemas/tracking-data';
import { BIOMETRIC_DATA_SCHEMA } from '@/schemas/biometric-data';
import { METADATA_SCHEMA } from '@/schemas/metadata';
import { uploadFile } from '@/api/utils';
import { setPublicAccess } from '@/api/access-control';

type TData = typeof data;
type TSeason = TData['seasons'][0];
type TMatch = TSeason['matches'][0];
type TEvent = TMatch['events'][0];
type TTracking = TMatch['tracking'][0];
type TBiometric = TMatch['biometric'][0];

export async function seedDb(session: Session, pod: string) {
  // Create season containers for all data types
  const seasonsToCreate = [
    paths.footballData.club.season.root(pod, '2025'),
    paths.eventData.club.season.root(pod, '2025'),
    paths.trackingData.matches.season(pod, '2025'),
    paths.biometricData.matches.season(pod, '2025'),
  ];
  await Promise.all([
    seasonsToCreate.map(async (season) => {
      await safeCall(createContainerAt(season, { fetch: session.fetch }));
    }),
  ]);

  // Seed data
  await seedPersonalData(session, pod, data);
  await seedMatchData(session, pod, data.seasons[0]);
  await seedAggregationData(session, pod, data);
}

async function seedPersonalData(session: Session, pod: string, data: TData) {
  console.log('Seeding personal data...');

  const imageUrl = '/profile.jpg';
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const file = new File([blob], 'profile.jpg', { type: blob.type });
  await uploadFile(session, pod, paths.root(pod), file);
  await setPublicAccess({
    session,
    url: `${paths.root(pod)}/profile.jpg`,
    modes: ['Read'],
  });

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
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.team, data.team)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.league, data.league)
    .addStringNoLocale(PERSONAL_DATA_SCHEMA.position, data.position)
    .build();
  dataset = setThing(dataset, thing);
  await safeCall(
    saveSolidDatasetAt(paths.personalData(pod), dataset, {
      fetch: session.fetch,
    })
  );
}

async function seedMatchData(session: Session, pod: string, season: TSeason) {
  console.log('Seeding football data...');

  await Promise.all(
    season.matches.map(async (match) => {
      // Create new match
      const id = crypto.randomUUID();
      let dataset = createSolidDataset();
      const thing = buildThing(createThing({ name: id }))
        .addUrl(RDF.type, FOOTBALL_DATA_SCHEMA.type)
        .addStringNoLocale(FOOTBALL_DATA_SCHEMA.homeTeam, match.home)
        .addStringNoLocale(FOOTBALL_DATA_SCHEMA.awayTeam, match.away)
        .addInteger(FOOTBALL_DATA_SCHEMA.homeScore, match.homeScore)
        .addInteger(FOOTBALL_DATA_SCHEMA.awayScore, match.awayScore)
        .addDate(FOOTBALL_DATA_SCHEMA.date, new Date(match.date))
        .addInteger(FOOTBALL_DATA_SCHEMA.playTime, match.playTime)
        .addStringNoLocale(FOOTBALL_DATA_SCHEMA.position, match.position)
        .build();
      dataset = setThing(dataset, thing);

      // Save match
      saveSolidDatasetAt(
        paths.footballData.club.season.match(pod, season.title, id),
        dataset,
        { fetch: session.fetch }
      );

      await seedMatchEvents(session, pod, id, season.title, match.events);
      await seedMatchTrackingData(
        session,
        pod,
        id,
        season.title,
        match.tracking
      );
      await seedMatchBiometricData(
        session,
        pod,
        id,
        season.title,
        match.biometric
      );
    })
  );
}

async function seedMatchEvents(
  session: Session,
  pod: string,
  matchId: string,
  season: string,
  events: TEvent[]
) {
  console.log('Seeding events for match', matchId);

  let dataset = createSolidDataset();
  const metadata = buildThing(createThing({ name: 'metadata' }))
    .addUrl(RDF.type, METADATA_SCHEMA.type)
    .addStringNoLocale(
      METADATA_SCHEMA.match,
      paths.footballData.club.season.match(pod, season, matchId)
    )
    .build();
  dataset = setThing(dataset, metadata);

  events.forEach((event) => {
    const eventId = crypto.randomUUID();
    const thing = buildThing(createThing({ name: eventId }))
      .addUrl(RDF.type, EVENT_DATA_SCHEMA.type)
      .addStringNoLocale(EVENT_DATA_SCHEMA.event, event.event)
      .addStringNoLocale(EVENT_DATA_SCHEMA.time, event.time)
      .addStringNoLocale(EVENT_DATA_SCHEMA.notes, event.notes)
      .build();
    dataset = setThing(dataset, thing);
  });

  await saveSolidDatasetAt(
    paths.eventData.club.season.match(pod, season, matchId),
    dataset,
    { fetch: session.fetch }
  );
}

async function seedMatchTrackingData(
  session: Session,
  pod: string,
  matchId: string,
  season: string,
  trackingData: TTracking[]
) {
  console.log('Seeding tracking data for match', matchId);

  let dataset = createSolidDataset();
  const metadata = buildThing(createThing({ name: 'metadata' }))
    .addUrl(RDF.type, METADATA_SCHEMA.type)
    .addStringNoLocale(
      METADATA_SCHEMA.match,
      paths.footballData.club.season.match(pod, season, matchId)
    )
    .build();
  dataset = setThing(dataset, metadata);

  trackingData.forEach((data) => {
    const trackingId = crypto.randomUUID();
    const thing = buildThing(createThing({ name: trackingId }))
      .addUrl(RDF.type, TRACKING_DATA_SCHEMA.type)
      .addStringNoLocale(
        TRACKING_DATA_SCHEMA.coordinates,
        `${data.coordinations.x}, ${data.coordinations.y}, ${data.coordinations.z}`
      )
      .addStringNoLocale(TRACKING_DATA_SCHEMA.time, data.timestamp)
      .addInteger(TRACKING_DATA_SCHEMA.speed, data.speed)
      .build();
    dataset = setThing(dataset, thing);
  });

  await saveSolidDatasetAt(
    paths.trackingData.matches.match(pod, season, matchId),
    dataset,
    { fetch: session.fetch }
  );
}

async function seedMatchBiometricData(
  session: Session,
  pod: string,
  matchId: string,
  season: string,
  biometricData: TBiometric[]
) {
  console.log('Seeding biometric data for match', matchId);

  let dataset = createSolidDataset();
  const metadata = buildThing(createThing({ name: 'metadata' }))
    .addUrl(RDF.type, METADATA_SCHEMA.type)
    .addStringNoLocale(
      METADATA_SCHEMA.match,
      paths.footballData.club.season.match(pod, season, matchId)
    )
    .build();
  dataset = setThing(dataset, metadata);

  biometricData.forEach((data) => {
    const biometricId = crypto.randomUUID();
    const thing = buildThing(createThing({ name: biometricId }))
      .addUrl(RDF.type, BIOMETRIC_DATA_SCHEMA.type)
      .addStringNoLocale(BIOMETRIC_DATA_SCHEMA.label, data.type)
      .addStringNoLocale(BIOMETRIC_DATA_SCHEMA.value, `${data.value}`)
      .addStringNoLocale(BIOMETRIC_DATA_SCHEMA.time, data.timestamp)
      .build();
    dataset = setThing(dataset, thing);
  });

  await saveSolidDatasetAt(
    paths.biometricData.matches.match(pod, season, matchId),
    dataset,
    { fetch: session.fetch }
  );
}

async function seedAggregationData(session: Session, pod: string, data: TData) {
  console.log('Seeding aggregation data...');
  const aggregationDatasets = [];
  // Football data aggregations
  // Club level
  let clubMatchAggregation = createSolidDataset();
  const clubAggregationThing = buildThing(createThing({ name: 'aggregation' }))
    .addUrl(RDF.type, FOOTBALL_AGGREGATION_SCHEMA.type)
    .addInteger(
      FOOTBALL_AGGREGATION_SCHEMA.matches,
      data.seasons.flatMap((season) => season.matches).length
    )
    .build();
  clubMatchAggregation = setThing(clubMatchAggregation, clubAggregationThing);
  aggregationDatasets.push({
    dataset: clubMatchAggregation,
    path: paths.footballData.club.aggregation(pod),
  });

  // Season level
  data.seasons.forEach((season) => {
    let seasonMatchAggregation = createSolidDataset();
    const seasonAggregationThing = buildThing(
      createThing({ name: 'aggregation' })
    )
      .addUrl(RDF.type, FOOTBALL_AGGREGATION_SCHEMA.type)
      .addInteger(
        FOOTBALL_AGGREGATION_SCHEMA.matches,
        data.seasons[0].matches.length
      )
      .build();
    seasonMatchAggregation = setThing(
      seasonMatchAggregation,
      seasonAggregationThing
    );
    aggregationDatasets.push({
      dataset: seasonMatchAggregation,
      path: paths.footballData.club.season.aggregation(pod, season.title),
    });
  });

  // Event data aggregations
  // Club level
  const clubEventTotals = getEventAggregation(
    data.seasons.flatMap((season) => season.matches)
  );
  let clubEventAggregation = createSolidDataset();
  const clubEventAggregationThing = buildThing(
    createThing({ name: 'aggregation' })
  )
    .addUrl(RDF.type, EVENT_DATA_SCHEMA.type)
    .addInteger(EVENT_AGGREGATION_SCHEMA.goals, clubEventTotals.goals)
    .addInteger(
      EVENT_AGGREGATION_SCHEMA.yellowCards,
      clubEventTotals.yellowCards
    )
    .addInteger(EVENT_AGGREGATION_SCHEMA.redCards, clubEventTotals.redCards)
    .addInteger(EVENT_AGGREGATION_SCHEMA.corners, clubEventTotals.corners)
    .addInteger(EVENT_AGGREGATION_SCHEMA.freeKicks, clubEventTotals.freeKicks)
    .addInteger(EVENT_AGGREGATION_SCHEMA.penalties, clubEventTotals.penalties)
    .addInteger(EVENT_AGGREGATION_SCHEMA.throwIns, clubEventTotals.throwIns)
    .build();
  clubEventAggregation = setThing(
    clubEventAggregation,
    clubEventAggregationThing
  );
  aggregationDatasets.push({
    dataset: clubEventAggregation,
    path: paths.eventData.club.aggregation(pod),
  });

  // Season level
  data.seasons.forEach((season) => {
    const seasonEventTotals = getEventAggregation(season.matches);
    let seasonEventAggregation = createSolidDataset();
    const seasonEventAggregationThing = buildThing(
      createThing({ name: 'aggregation' })
    )
      .addUrl(RDF.type, EVENT_DATA_SCHEMA.type)
      .addInteger(EVENT_AGGREGATION_SCHEMA.goals, seasonEventTotals.goals)
      .addInteger(
        EVENT_AGGREGATION_SCHEMA.yellowCards,
        seasonEventTotals.yellowCards
      )
      .addInteger(EVENT_AGGREGATION_SCHEMA.redCards, seasonEventTotals.redCards)
      .addInteger(EVENT_AGGREGATION_SCHEMA.corners, seasonEventTotals.corners)
      .addInteger(
        EVENT_AGGREGATION_SCHEMA.freeKicks,
        seasonEventTotals.freeKicks
      )
      .addInteger(
        EVENT_AGGREGATION_SCHEMA.penalties,
        seasonEventTotals.penalties
      )
      .addInteger(EVENT_AGGREGATION_SCHEMA.throwIns, seasonEventTotals.throwIns)
      .build();
    seasonEventAggregation = setThing(
      seasonEventAggregation,
      seasonEventAggregationThing
    );
    aggregationDatasets.push({
      dataset: seasonEventAggregation,
      path: paths.eventData.club.season.aggregation(pod, season.title),
    });
  });

  await Promise.all(
    aggregationDatasets.map(async (obj) => {
      await safeCall(
        saveSolidDatasetAt(obj.path, obj.dataset, { fetch: session.fetch })
      );
    })
  );
}

function getEventAggregation(matches: TMatch[]) {
  const eventTotals = {
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    freeKicks: 0,
    penalties: 0,
    throwIns: 0,
  };
  matches.forEach((match) => {
    match.events.forEach((event) => {
      switch (event.event) {
        case 'Goal':
          eventTotals.goals++;
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
