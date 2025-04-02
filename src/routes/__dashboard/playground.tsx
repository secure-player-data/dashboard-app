import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { paths } from '@/api/paths';
import { QueryEngine } from '@comunica/query-sparql';
import { sendInformation } from '@/api/inbox';
import { useState } from 'react';
import { Session } from '@inrupt/solid-client-authn-browser';

export const Route = createFileRoute('/__dashboard/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const [working, setWorking] = useState<string>('');
  const [objects, setObjects] = useState<streamObject[]>([]);
  const [amount, setAmount] = useState<number>(0);

  const myEngine = new QueryEngine();

  const source = `${paths.eventData(pod!)}`;

  type streamObject = {
    s: string;
    p: string;
    o: string;
  };

  const handleClick = async () => {
    if (!session) {
      throw new Error('could not find session');
    }

    const bindingStream = await myEngine.queryBindings(
      `SELECT ?s ?p ?o WHERE {
    ?s ?p ?o.
    ?s ?p ?o
  } LIMIT 25 OFFSET ${objects.length}`,
      { sources: [source], fetch: session.fetch }
    );

    bindingStream.on('data', (binding: any) => {
      setObjects((prevObjects) => [
        ...prevObjects,
        {
          s: binding.get('s').value,
          p: binding.get('p').value,
          o: binding.get('o').value,
        },
      ]);
    });
    const array = await bindingStream.toArray();
    console.log(array);
    console.log('finished iterating data');

    bindingStream.on('error', (binding: any) => {
      console.log('error: ', binding);
    });
    console.log('fetched objects: ', objects);
    console.log('number of fetched objects: ', objects.length);
  };

  const handleFillInbox = async (amount: number) => {
    setWorking('working');
    console.log('credentials of information to send: ', session, pod);

    const promises = Array.from({ length: amount }, (_, i) =>
      sendInformation(
        session,
        pod,
        pod,
        '*POOF*',
        `you have been visited by the inbox filler fairy. She has visited you ${i + 1} times`
      )
    );

    try {
      await Promise.all(promises);
      setWorking('done!');
    } catch (error) {
      setWorking('error');
      console.log(error);
    }
  };
  return (
    <div className="flex justify-center flex-col items-center h-full gap-2">
      <div className="flex flex-row gap-2">
        <Button onClick={() => handleClick()}>test sparql</Button>
        <Button onClick={() => setObjects([])}>clear</Button>
        <Button className="bg-red-500" onClick={() => handleFillInbox(100)}>
          fill inbox with 100
        </Button>
        <Button className="bg-red-500" onClick={() => handleFillInbox(1)}>
          fill inbox with 1
        </Button>

        {working && <div>({working})</div>}
      </div>
      <div className="flex flex-col gap-2 m-6">
        number of fetched objects: {objects.length}
        {objects &&
          objects.map((object, index) => (
            <div key={index} className="border-[1.5px] border-green-500 p-2">
              object {index}: {object.s}, {object.p}, {object.o}
            </div>
          ))}
      </div>
    </div>
  );
}
