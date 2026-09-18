import ThanksForComing from '../templates/ThanksForComing';
import { brand, customer, screamPaintSip } from '../fixtures';

/** Preview: thanks-for-coming. Run `npm run email:dev` and open it in the sidebar. */
export default function ThanksForComingPreview() {
  return <ThanksForComing brand={brand} customer={customer} event={screamPaintSip} reviewUrl="https://g.page/r/oasis-review" />;
}
