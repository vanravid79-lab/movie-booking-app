import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Ticket,
} from "lucide-react";
import type { ScheduleInfo, Seat } from "./SeatSelectionPage";

interface CheckoutState {
  schedule: ScheduleInfo;
  seats: Seat[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) => value.slice(0, 5);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5059/api";

export default function CheckoutPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const checkout = location.state as CheckoutState | null;
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });

  if (!checkout?.schedule || checkout.seats.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-center text-white">
        <div className="max-w-md">
          <Ticket className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-5 font-serif text-3xl font-bold">Your seats are not selected</h1>
          <p className="mt-3 text-sm text-zinc-400">Return to the showtime and choose at least one available seat to continue.</p>
          <button type="button" onClick={() => navigate(-1)} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-300"><ArrowLeft className="h-4 w-4" />Back to seats</button>
        </div>
      </main>
    );
  }

  const { schedule, seats } = checkout;
  const ticketPrice = Number(schedule.ticket_price);
  const subtotal = seats.length * ticketPrice;

  const updateCustomer = (field: keyof typeof customer, value: string) =>
    setCustomer((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("cambo_token");
    if (!token) {
      setSubmitError("Please sign in before placing your order.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleId: Number(scheduleId),
          seatIds: seats.map((seat) => seat.seat_id),
          customer,
          paymentMethod,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to place booking.");
      }
      setBookingId(data.bookingId);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to place booking.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#27201a_0,#090909_38%,#000_75%)] px-4 py-10 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-amber-400/20 bg-zinc-950/90 p-8 text-center shadow-2xl shadow-black/40 sm:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Order received</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">Enjoy the show, {customer.name}</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">Booking #{bookingId} for {schedule.movie_title} is confirmed. A confirmation will be sent to {customer.email}.</p>
          <button type="button" onClick={() => navigate("/")} className="mt-8 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300">Return home</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#27201a_0,#090909_38%,#000_75%)] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-amber-400"><ArrowLeft className="h-4 w-4" />Back to seats</button>
        <header className="border-b border-white/10 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Final step</p>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Complete your booking</h1>
          <p className="mt-2 text-zinc-400">Review your seats and enter your details to reserve your cinema experience.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-zinc-950/80 p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3"><div className="rounded-lg bg-amber-400/10 p-2 text-amber-400"><CreditCard className="h-5 w-5" /></div><div><h2 className="font-semibold">Contact details</h2><p className="text-xs text-zinc-500">Your confirmation will be sent here.</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-zinc-300 sm:col-span-2">Full name<input required value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white outline-none transition focus:border-amber-400" placeholder="Your name" /></label>
                <label className="text-sm text-zinc-300">Email address<input required type="email" value={customer.email} onChange={(event) => updateCustomer("email", event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white outline-none transition focus:border-amber-400" placeholder="you@example.com" /></label>
                <label className="text-sm text-zinc-300">Phone number<input required type="tel" value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white outline-none transition focus:border-amber-400" placeholder="+855 ..." /></label>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-zinc-950/80 p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3"><div className="rounded-lg bg-amber-400/10 p-2 text-amber-400"><LockKeyhole className="h-5 w-5" /></div><div><h2 className="font-semibold">Payment method</h2><p className="text-xs text-zinc-500">Choose how you would like to pay.</p></div></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[{ id: "card", label: "Card" }, { id: "cash", label: "At cinema" }, { id: "wallet", label: "E-wallet" }].map((method) => <label key={method.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition ${paymentMethod === method.id ? "border-amber-400 bg-amber-400/10 text-white" : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600"}`}><input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(event) => setPaymentMethod(event.target.value)} className="accent-amber-400" />{method.label}</label>)}
              </div>
              {paymentMethod === "card" && <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">Card details will be collected securely at the next payment step.</div>}
            </section>
          </div>

          <aside className="rounded-xl border border-white/10 bg-zinc-950/90 p-5 shadow-xl shadow-black/20 lg:sticky lg:top-6">
            <h2 className="border-b border-white/10 pb-4 font-semibold">Order summary</h2>
            <div className="space-y-4 border-b border-white/10 py-5">
              <div><h3 className="font-serif text-xl font-bold">{schedule.movie_title}</h3><p className="mt-1 text-sm text-zinc-400">{schedule.cinema_name} · {schedule.hall_name}</p></div>
              <div className="space-y-2 text-sm text-zinc-400"><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-amber-400" />{formatDate(schedule.schedule_date)} at {formatTime(schedule.start_time)}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" />Seats: <span className="text-white">{seats.map((seat) => seat.seat_number).join(", ")}</span></p></div>
            </div>
            <dl className="space-y-3 py-5 text-sm"><div className="flex justify-between text-zinc-400"><dt>{seats.length} ticket{seats.length === 1 ? "" : "s"}</dt><dd className="text-white">${subtotal.toFixed(2)}</dd></div><div className="flex justify-between text-zinc-400"><dt>Service fee</dt><dd className="text-white">$0.00</dd></div></dl>
            <div className="flex justify-between border-t border-white/10 pt-4"><span className="font-semibold">Total</span><strong className="text-2xl text-amber-400">${subtotal.toFixed(2)}</strong></div>
            {submitError && <p role="alert" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{submitError}</p>}
            <button type="submit" disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-3.5 font-bold text-black transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"><LockKeyhole className="h-4 w-4" />{submitting ? "Saving booking..." : "Place order"}</button>
            <p className="mt-3 text-center text-[11px] text-zinc-600">By placing your order, you agree to the cinema booking terms.</p>
          </aside>
        </form>
      </div>
    </main>
  );
}