import TicketConfirmation from '../../templates/TicketConfirmation';
import { brand, customer, screamPaintSip, singleTicketOrder, singleTicket } from '../../fixtures';

/** Preview: ticket-confirmation/single-ticket. Run `npm run email:dev` and open it in the sidebar. */
export default function SingleTicketPreview() {
  return <TicketConfirmation brand={brand} customer={customer} event={screamPaintSip} order={singleTicketOrder} tickets={singleTicket} />;
}
