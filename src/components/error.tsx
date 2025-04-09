import { extractJsonObject } from '@/utils';

export default function Error({ error }: { error: Error }) {
  const json = extractJsonObject(error.message);
  const status = json?.status;

  if (!json || Object.keys(json).length === 0) {
    return (
      <div>
        Something went wrong. We are looking into it, please try again later.
      </div>
    );
  }

  if (!status) {
    return (
      <div>
        Something went wrong. We are looking into it, please try again later.
      </div>
    );
  }

  if (status === 404) {
    return <div>The requested resource was not found</div>;
  }

  if (status === 403) {
    return <div>You do not have permission to access this resource</div>;
  }

  return (
    <div>
      Something went wrong. We are looking into it, please try again later.
    </div>
  );
}
