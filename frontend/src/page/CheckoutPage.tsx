import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Landmark,
  LockKeyhole,
  MapPin,
  Ticket,
  Wallet,
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

const foodOptions = [
  {
    id: "popcorn",
    name: "Crispy Popcorn",
    description: "Classic salted popcorn",
    price: 4.5,
    emoji: "🍿",
  },
  {
    id: "caramel-popcorn",
    name: "Caramel Popcorn",
    description: "Sweet and crunchy snack",
    price: 5.5,
    emoji: "🍫",
  },
  {
    id: "cola",
    name: "Coca-Cola",
    description: "Refreshing soft drink",
    price: 2.5,
    emoji: "🥤",
  },
  {
    id: "sprite",
    name: "Sprite",
    description: "Citrus soda",
    price: 2.5,
    emoji: "🧃",
  },
  {
    id: "water",
    name: "Mineral Water",
    description: "Fresh bottled water",
    price: 1.5,
    emoji: "💧",
  },
  {
    id: "combo",
    name: "Movie Combo",
    description: "Popcorn + drink bundle",
    price: 6.0,
    emoji: "🍿🥤",
  },
  {
    id: "chips",
    name: "Potato Chips",
    description: "Crunchy snack pack",
    price: 3.0,
    emoji: "🥨",
  },
  {
    id: "cookie",
    name: "Chocolate Cookie",
    description: "Soft and sweet dessert",
    price: 2.8,
    emoji: "🍪",
  },
  {
    id: "nuggets",
    name: "Chicken Nuggets",
    description: "Crispy savory bites",
    price: 5.0,
    emoji: "🍗",
  },
  {
    id: "coffee",
    name: "Hot Coffee",
    description: "Smooth espresso drink",
    price: 3.2,
    emoji: "☕",
  },
];

export default function CheckoutPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const checkout = location.state as CheckoutState | null;
  const [paymentMethod, setPaymentMethod] = useState("aba");
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [selectedFoods, setSelectedFoods] = useState<Record<string, number>>(
    {},
  );

  if (!checkout?.schedule || checkout.seats.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-center text-white">
        <div className="max-w-md">
          <Ticket className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-5 font-serif text-3xl font-bold">
            Your seats are not selected
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Return to the showtime and choose at least one available seat to
            continue.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 font-semibold text-black hover:bg-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to seats
          </button>
        </div>
      </main>
    );
  }

  const { schedule, seats } = checkout;
  const ticketPrice = Number(schedule.ticket_price);
  const subtotal = seats.length * ticketPrice;

  const updateFoodQuantity = (foodId: string, step: number) => {
    setSelectedFoods((current) => {
      const nextQty = Math.max(0, (current[foodId] ?? 0) + step);
      return {
        ...current,
        [foodId]: nextQty,
      };
    });
  };

  const foodItems = foodOptions
    .map((food) => ({
      ...food,
      quantity: selectedFoods[food.id] ?? 0,
    }))
    .filter((food) => food.quantity > 0);

  const foodSubtotal = foodItems.reduce(
    (sum, food) => sum + food.price * food.quantity,
    0,
  );

  const totalAmount = subtotal + foodSubtotal;

  const paymentOptions = [
    {
      id: "card",
      label: "Visa / Mastercard",
      subtitle: "Cards & digital payment",
      icon: CreditCard,
    },
    {
      id: "aba",
      label: "ABA PAYWAY",
      subtitle: "Cambodia mobile banking",
      icon: Landmark,
    },
    {
      id: "acleda",
      label: "ACLEDA",
      subtitle: "Bank transfer & mobile wallet",
      icon: Building2,
    },
    {
      id: "wing",
      label: "Wing",
      subtitle: "E-wallet payment",
      icon: Wallet,
    },
    {
      id: "cash",
      label: "Cash at cinema",
      subtitle: "Pay on arrival",
      icon: Banknote,
    },
  ];

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
          foodItems: foodItems.map(({ id, name, price, quantity }) => ({
            foodId: id,
            name,
            price,
            quantity,
          })),
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
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Order received
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold">
            Enjoy the show, {customer.name}
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Booking #{bookingId} for {schedule.movie_title} is confirmed. A
            confirmation will be sent to {customer.email}.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300"
          >
            Return home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#312719_0%,#111215_28%,#090909_70%,#000000_100%)] px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to seats
        </button>
        <header className="border-b border-white/10 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-400">
            Final step
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
            Complete your booking
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Review your seats and enter your details to reserve your cinema
            experience.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
        >
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] ring-1 ring-white/5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-400 ring-1 ring-amber-400/20">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Contact details</h2>
                  <p className="text-xs text-zinc-500">
                    Your confirmation will be sent here.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-zinc-300 sm:col-span-2">
                  Full name
                  <input
                    required
                    value={customer.name}
                    onChange={(event) =>
                      updateCustomer("name", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="Your name"
                  />
                </label>
                <label className="text-sm text-zinc-300">
                  Email address
                  <input
                    required
                    type="email"
                    value={customer.email}
                    onChange={(event) =>
                      updateCustomer("email", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="text-sm text-zinc-300">
                  Phone number
                  <input
                    required
                    type="tel"
                    value={customer.phone}
                    onChange={(event) =>
                      updateCustomer("phone", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    placeholder="+855 ..."
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] ring-1 ring-white/5 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-400 ring-1 ring-amber-400/20">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Payment method</h2>
                  <p className="text-xs text-zinc-500">
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentOptions.map((method) => {
                  const Icon = method.icon;

                  return (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition duration-200 ${
                        paymentMethod === method.id
                          ? "border-amber-400 bg-amber-400/10 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                        className="accent-amber-400"
                      />
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-amber-400 ring-1 ring-white/5">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-white">
                          {method.label}
                        </span>
                        <span className="block text-xs text-zinc-400">
                          {method.subtitle}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {paymentMethod === "card" && (
                <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 text-sm text-zinc-300">
                  Card details will be collected securely at the next payment
                  step.
                </div>
              )}
              {paymentMethod === "aba" && (
                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  Pay with ABA PAYWAY using your Cambodia mobile banking
                  account.
                </div>
              )}
              {paymentMethod === "acleda" && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Use ACLEDA Bank transfer or app payment for your booking.
                </div>
              )}
              {paymentMethod === "wing" && (
                <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-violet-100">
                  Wing wallet payment is available for fast checkout in
                  Cambodia.
                </div>
              )}
              {paymentMethod === "cash" && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Pay in cash once you arrive at the cinema.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] ring-1 ring-white/5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-400 ring-1 ring-amber-400/20">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    Add food & drinks
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Upgrade your movie time with a snack combo.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {foodOptions.map((food) => {
                  const quantity = selectedFoods[food.id] ?? 0;

                  return (
                    <div
                      key={food.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-zinc-700 hover:bg-zinc-900"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400/20 to-yellow-600/10 text-lg ring-1 ring-amber-400/20">
                          {food.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {food.name}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            {food.description}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-amber-300">
                            ${food.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateFoodQuantity(food.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-lg text-zinc-200 transition hover:border-amber-400 hover:text-amber-300"
                          aria-label={`Remove ${food.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateFoodQuantity(food.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-lg font-bold text-black transition hover:bg-amber-300"
                          aria-label={`Add ${food.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-zinc-950/90 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.34)] ring-1 ring-white/5 lg:sticky lg:top-6">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-semibold text-white">Order summary</h2>
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                {seats.length} seat{seats.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-4 border-b border-white/10 py-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  {schedule.movie_title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {schedule.cinema_name} · {schedule.hall_name}
                </p>
              </div>
              <div className="space-y-2 text-sm text-zinc-400">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-amber-400" />
                  {formatDate(schedule.schedule_date)} at{" "}
                  {formatTime(schedule.start_time)}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Seats:{" "}
                  <span className="text-white">
                    {seats.map((seat) => seat.seat_number).join(", ")}
                  </span>
                </p>
              </div>
            </div>
            <dl className="space-y-3 py-5 text-sm">
              <div className="flex justify-between text-zinc-400">
                <dt>
                  {seats.length} ticket{seats.length === 1 ? "" : "s"}
                </dt>
                <dd className="text-white">${subtotal.toFixed(2)}</dd>
              </div>
              {foodItems.length > 0 && (
                <div className="space-y-2 rounded-xl border border-white/5 bg-zinc-900/60 p-3 text-zinc-300">
                  {foodItems.map((food) => (
                    <div
                      key={food.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        {food.name} x {food.quantity}
                      </span>
                      <span className="text-white">
                        ${(food.price * food.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <dt>Food & drinks</dt>
                <dd className="text-white">${foodSubtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-zinc-400">
                <dt>Service fee</dt>
                <dd className="text-white">$0.00</dd>
              </div>
            </dl>
            <div className="flex justify-between border-t border-white/10 pt-4">
              <span className="font-semibold text-zinc-200">Total</span>
              <strong className="text-2xl text-amber-400">
                ${totalAmount.toFixed(2)}
              </strong>
            </div>
            {submitError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-yellow-300 px-5 py-3.5 font-bold text-black shadow-[0_12px_24px_rgba(251,191,36,0.28)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
            >
              <LockKeyhole className="h-4 w-4" />
              {submitting ? "Saving booking..." : "Place order"}
            </button>
            <p className="mt-3 text-center text-[11px] text-zinc-600">
              By placing your order, you agree to the cinema booking terms.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
