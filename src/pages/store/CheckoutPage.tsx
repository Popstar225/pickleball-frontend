import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { selectCart, selectCartTotal, clearCart } from '@/store/slices/equipmentSlice';
import { CartItem, ShippingAddress } from '@/services/equipmentService';
import EquipmentService from '@/services/equipmentService';
import PaymentService from '@/services/paymentService';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft, ShoppingCart, MapPin, CreditCard, Loader2, AlertCircle, Package, Check,
} from 'lucide-react';
import { getFullImageUrl } from '@/common/tools';
import { cn } from '@/lib/utils';

function StripePaymentForm({
  paymentId,
  orderId,
  onSuccess,
  onError,
}: {
  paymentId: string;
  orderId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) { onError(error.message || 'Payment failed'); return; }
      if (paymentIntent?.status === 'succeeded') {
        await EquipmentService.confirmEquipmentCheckout(paymentId, paymentIntent.id, orderId);
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3.5 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-sans font-bold text-base rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Loader2 className={`w-4 h-4 animate-spin ${processing ? '' : 'hidden'}`} />
        <CreditCard className={`w-4 h-4 ${processing ? 'hidden' : ''}`} />
        {processing ? 'Procesando…' : 'Confirmar pago'}
      </button>
    </form>
  );
}

type Step = 'address' | 'review' | 'payment';

const STEPS: { key: Step; label: string }[] = [
  { key: 'address', label: 'Dirección' },
  { key: 'review', label: 'Revisión' },
  { key: 'payment', label: 'Pago' },
];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[#5A5A7A] text-[10px] uppercase tracking-widest mb-1.5 font-sans">
        {label}
      </label>
      {children}
      {error && <p className="text-[#FF6B35] text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 bg-[#1C1C27] border border-[#2A2A3E] rounded-xl text-white text-sm placeholder:text-[#3A3A5A] outline-none focus:border-[#353550] transition-colors';

export default function CheckoutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const cart = useSelector(selectCart);
  const cartTotal = useSelector(selectCartTotal);
  const authUser = useSelector((s: RootState) => s.auth.user);

  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<ShippingAddress>({
    full_name: authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() : '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'México',
    phone: authUser?.phone || '',
  });
  const [addrErrors, setAddrErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [paymentData, setPaymentData] = useState<{
    paymentId: string; clientSecret: string; orderId: string; orderNumber: string;
  } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white font-['DM_Sans',sans-serif]">
        <ShoppingCart className="w-12 h-12 text-[#2A2A3E] mb-4" />
        <p className="text-[#5A5A7A] mb-5">Tu carrito está vacío</p>
        <button
          onClick={() => navigate('/store')}
          className="px-6 py-3 bg-[#C8FF00] text-black font-sans font-bold text-sm rounded-xl hover:bg-[#d4ff1a] transition-all"
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  const validateAddress = () => {
    const e: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.full_name) e.full_name = 'Requerido';
    if (!address.address_line1) e.address_line1 = 'Requerido';
    if (!address.city) e.city = 'Requerido';
    if (!address.state) e.state = 'Requerido';
    if (!address.postal_code) e.postal_code = 'Requerido';
    setAddrErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceedToReview = () => { if (validateAddress()) setStep('review'); };

  const handleProceedToPayment = async () => {
    setLoadingPayment(true);
    setError(null);
    try {
      const orderRes = await EquipmentService.createOrder({
        items: cart.map((i: CartItem) => ({ product_id: i.product.id, quantity: i.quantity })),
        shipping_address: address,
      });
      const order = orderRes.data;
      const payRes = await EquipmentService.createEquipmentCheckout(order.id);
      setPaymentData({
        paymentId: payRes.data.payment_id,
        clientSecret: payRes.data.client_secret,
        orderId: order.id,
        orderNumber: order.order_number,
      });
      setStep('payment');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al crear el pedido');
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    dispatch(clearCart());
    navigate(`/store/order-confirmation/${paymentData!.orderNumber}`);
  };

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['DM_Sans',sans-serif]">
      {/* Topnav */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-[#1E1E2E]">
        <div className="max-w-5xl mx-auto px-5 h-[60px] flex items-center gap-6">
          <button
            onClick={() => navigate('/store/cart')}
            className="flex items-center gap-2 text-[#9090B0] hover:text-white text-sm transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Carrito
          </button>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-[#1E1E2E]" />}
                <div className={cn(
                  'flex items-center gap-2 text-sm transition-colors',
                  currentStepIndex === i ? 'text-white' : currentStepIndex > i ? 'text-[#C8FF00]' : 'text-[#3A3A5A]'
                )}>
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-sans transition-all',
                    currentStepIndex === i
                      ? 'bg-[#C8FF00] text-black'
                      : currentStepIndex > i
                        ? 'bg-[rgba(200,255,0,0.15)] border border-[rgba(200,255,0,0.3)] text-[#C8FF00]'
                        : 'bg-[#13131A] border border-[#2A2A3E]'
                  )}>
                    {currentStepIndex > i ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {error && (
          <div className="mb-6 p-4 bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.2)] rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />
            <span className="text-[#FF6B35] text-sm">{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">

            {/* Step 1: Address */}
            {step === 'address' && (
              <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-6">
                <h2 className="font-sans font-bold text-base flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-[#C8FF00]" />
                  Dirección de envío
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Nombre completo" error={addrErrors.full_name}>
                    <input
                      value={address.full_name}
                      onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))}
                      placeholder="Juan García"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Calle y número" error={addrErrors.address_line1}>
                    <input
                      value={address.address_line1}
                      onChange={e => setAddress(a => ({ ...a, address_line1: e.target.value }))}
                      placeholder="Av. Insurgentes 123"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Colonia / Apartamento (opcional)">
                    <input
                      value={address.address_line2 || ''}
                      onChange={e => setAddress(a => ({ ...a, address_line2: e.target.value }))}
                      placeholder="Col. Centro"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Ciudad" error={addrErrors.city}>
                      <input
                        value={address.city}
                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                        placeholder="Ciudad de México"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Estado" error={addrErrors.state}>
                      <input
                        value={address.state}
                        onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                        placeholder="CDMX"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Código postal" error={addrErrors.postal_code}>
                      <input
                        value={address.postal_code}
                        onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value }))}
                        placeholder="06600"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="País">
                      <input
                        value={address.country}
                        onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                        placeholder="México"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Teléfono (opcional)">
                    <input
                      value={address.phone || ''}
                      onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                      placeholder="+52 55 1234 5678"
                      className={inputCls}
                    />
                  </Field>
                </div>
                <button
                  onClick={handleProceedToReview}
                  className="w-full py-3.5 mt-5 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-sans font-bold text-sm rounded-xl transition-all"
                >
                  Continuar a revisión
                </button>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 'review' && (
              <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-6">
                <h2 className="font-sans font-bold text-base mb-5">Revisar pedido</h2>

                {/* Address summary */}
                <div className="bg-[#1C1C27] border border-[#2A2A3E] rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#5A5A7A] text-[10px] uppercase tracking-widest mb-2 font-sans">
                        Enviar a
                      </p>
                      <p className="font-medium text-sm">{address.full_name}</p>
                      <p className="text-[#9090B0] text-sm">{address.address_line1}</p>
                      {address.address_line2 && (
                        <p className="text-[#9090B0] text-sm">{address.address_line2}</p>
                      )}
                      <p className="text-[#9090B0] text-sm">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep('address')}
                      className="text-[#C8FF00] text-xs hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                </div>

                {/* Cart items */}
                <div className="space-y-2 mb-4">
                  {cart.map((item: CartItem) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 bg-[#1C1C27] rounded-xl"
                    >
                      <div className="w-12 h-12 bg-[#252535] rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={getFullImageUrl(item.product.images[0]) ?? ''}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="w-5 h-5 text-[#3A3A5A]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-[#5A5A7A] text-xs">×{item.quantity}</p>
                      </div>
                      <span className="font-sans font-bold text-[#C8FF00] text-sm flex-shrink-0">
                        ${(Number(item.product.price) * item.quantity).toLocaleString()} MXN
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1E1E2E] pt-4 flex justify-between items-baseline mb-5">
                  <span className="font-sans font-bold">Total</span>
                  <div>
                    <span className="font-sans font-extrabold text-xl text-[#C8FF00]">
                      ${cartTotal.toLocaleString()}
                    </span>
                    <span className="text-[#5A5A7A] text-xs ml-1">MXN</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={loadingPayment}
                  className="w-full py-3.5 bg-[#C8FF00] hover:bg-[#d4ff1a] text-black font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  <Loader2 className={`w-4 h-4 animate-spin ${loadingPayment ? '' : 'hidden'}`} />
                  <CreditCard className={`w-4 h-4 ${loadingPayment ? 'hidden' : ''}`} />
                  {loadingPayment ? 'Preparando pago…' : 'Ir al pago'}
                </button>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && paymentData && (
              <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-6">
                <h2 className="font-sans font-bold text-base flex items-center gap-2 mb-5">
                  <CreditCard className="w-4 h-4 text-[#C8FF00]" />
                  Pago seguro
                </h2>

                <div className="bg-[rgba(200,255,0,0.06)] border border-[rgba(200,255,0,0.12)] rounded-xl p-4 mb-5">
                  <p className="text-[#9090B0] text-sm">
                    Pedido{' '}
                    <span className="text-white font-medium">{paymentData.orderNumber}</span>
                  </p>
                  <p className="font-sans font-extrabold text-xl text-[#C8FF00] mt-1">
                    ${cartTotal.toLocaleString()} MXN
                  </p>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret: paymentData.clientSecret }}
                >
                  <StripePaymentForm
                    paymentId={paymentData.paymentId}
                    orderId={paymentData.orderId}
                    onSuccess={handlePaymentSuccess}
                    onError={setError}
                  />
                </Elements>

                <button
                  onClick={() => setStep('review')}
                  className="w-full py-2.5 mt-3 text-[#5A5A7A] text-sm hover:text-[#9090B0] transition-colors"
                >
                  Volver a revisión
                </button>
              </div>
            )}
          </div>

          {/* Aside summary */}
          <div>
            <div className="bg-[#13131A] border border-[#1E1E2E] rounded-2xl p-5 sticky top-20">
              <p className="text-[#5A5A7A] text-[10px] uppercase tracking-widest font-sans mb-4">
                Resumen
              </p>
              <div className="space-y-2.5 mb-4">
                {cart.map((item: CartItem) => (
                  <div key={item.product.id} className="flex justify-between text-xs">
                    <span className="text-[#5A5A7A] flex-1 truncate mr-2">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="text-white flex-shrink-0">
                      ${(Number(item.product.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1E1E2E] pt-3 mb-2">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#5A5A7A]">Envío</span>
                  <span className="text-[#C8FF00] font-semibold">Gratis</span>
                </div>
              </div>
              <div className="border-t border-[#1E1E2E] pt-3 flex justify-between items-baseline">
                <span className="font-sans font-bold text-sm">Total</span>
                <div>
                  <span className="font-sans font-extrabold text-lg text-[#C8FF00]">
                    ${cartTotal.toLocaleString()}
                  </span>
                  <span className="text-[#5A5A7A] text-xs ml-1">MXN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}