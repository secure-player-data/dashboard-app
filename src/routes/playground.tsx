import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { saveSolidDatasetInContainer } from '@inrupt/solid-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useAuth();

  async function test() {
    if (!session) return;

    const turtleData = `
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<#me>
  a foaf:Person ;
  foaf:name "Joakim Example" .
		`;

    const accessHistory =
      'https://storage.inrupt.com/72965f19-552a-472d-87c8-3010ac6166e1/secure-player-data/access-history/';

    try {
      const response = await session.fetch(accessHistory, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/turtle',
          Slug: '123', // Suggests a filename
        },
        body: turtleData,
      });
      console.log('response', response);
      // const res = await session.fetch(
      //   'https://storage.inrupt.com/72965f19-552a-472d-87c8-3010ac6166e1/secure-player-data/access-history/test.ttl',
      //   {
      //     method: 'PUT',
      //     headers: {
      //       'Content-Type': 'text/turtle',
      //     },
      //     body: tutleData,
      //   }
      // );
      // console.log('res', res);

      // if (res.ok) {
      //   const text = await res.text();
      //   console.log('text', text);
      // }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <Button onClick={test}>Test</Button>
    </div>
  );
}
