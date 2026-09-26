import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery, type PreloadedQuery } from 'react-relay';
import { LocationDetails } from '@/components/locations/LocationDetails';
import { LocationForm } from '@/components/locations/LocationForm';
import { QueryBoundary } from '@/relay/QueryBoundary';
import { useRouteQuery } from '@/relay/useRouteQuery';
import type { LocationPageQuery } from './__generated__/LocationPageQuery.graphql';

const query = graphql`
  query LocationPageQuery($id: ID!) {
    clogLocation(id: $id) { id ...LocationDetails_location ...LocationForm_location }
  }
`;
export function LocationPage() { return <LocationRoute edit={false} />; }
export function EditLocationPage() { return <LocationRoute edit />; }
function LocationRoute({ edit }: { edit: boolean }) {
  const { id = '' } = useParams();
  const [revision, setRevision] = useState(0);
  const variables = useMemo(() => ({ id }), [id]);
  const reference = useRouteQuery<LocationPageQuery>(query, variables, revision);
  return <QueryBoundary key={reference?.fetchKey ?? "initial"} retry={() => setRevision((value) => value + 1)}>
    {reference ? <Detail reference={reference} edit={edit} /> : <p role="status">Loading...</p>}
  </QueryBoundary>;
}
function Detail({ reference, edit }: { reference: PreloadedQuery<LocationPageQuery>; edit: boolean }) {
  const { clogLocation } = usePreloadedQuery<LocationPageQuery>(query, reference);
  if (!clogLocation) return <p>Location not found</p>;
  return edit ? <LocationForm key={clogLocation.id} locationRef={clogLocation} /> : <LocationDetails locationRef={clogLocation} />;
}
