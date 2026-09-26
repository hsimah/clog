import type { ComponentPropsWithRef } from 'react';
import { Link } from 'react-router-dom';

/** Astryx uses href; React Router owns the /clog basename and browser history. */
export function RouterLink({ href, ...props }: ComponentPropsWithRef<'a'>) {
  if (!href || !href.startsWith('/') || href.startsWith('//')) {
    return <a href={href} {...props} />;
  }
  return <Link to={href} {...props} />;
}
