import TicketConfirmation from '../../templates/TicketConfirmation';
import { brand, customer, screamPaintSip, itemizedOrder, threeTickets } from '../../fixtures';

/** Preview: ticket-confirmation/itemized-fees. Run `npm run email:dev` and open it in the sidebar. */
export default function ItemizedFeesPreview() {
  return <TicketConfirmation brand={brand} customer={customer} event={screamPaintSip} order={itemizedOrder} tickets={threeTickets.slice(0, 2)} />;
}
