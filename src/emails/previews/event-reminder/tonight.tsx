import EventReminder from '../../templates/EventReminder';
import { brand, customer, snoopyPaintSip, singleTicketOrder, singleTicket } from '../../fixtures';

/** Preview: event-reminder/tonight. Run `npm run email:dev` and open it in the sidebar. */
export default function TonightPreview() {
  return <EventReminder brand={brand} customer={customer} event={snoopyPaintSip} order={singleTicketOrder} tickets={singleTicket} timing="tonight" />;
}
