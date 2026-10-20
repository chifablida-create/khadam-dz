import React, { useState } from 'react';
import { Phone, MessageSquare, CheckCircle2, Clock, Star, AlertTriangle, MapPin, Plus } from 'lucide-react';
import { RequestItem, RatingItem } from '../types';
import { getCraftIcon, formatRelativeTime } from '../data/constants';

interface OrdersViewProps {
  userMode: 'craftsman' | 'customer';
  requests: RequestItem[];
  revealedSet: Set<string>;
  ratings: RatingItem[];
  onOpenCreateModal: () => void;
  onOpenRatingModal: (req: RequestItem) => void;
  onOpenComplaintModal: (req: RequestItem) => void;
  onToggleCompleteOrder: (reqId: string) => void;
  isDark: boolean;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  userMode,
  requests,
  revealedSet,
  ratings,
  onOpenCreateModal,
  onOpenRatingModal,
  onOpenComplaintModal,
  onToggleCompleteOrder,
  isDark
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'completed'>('all');

  const userOrders = userMode === 'craftsman'
    ? requests.filter((r) => revealedSet.has(r.id))
    : requests.filter((r) => r.isCustomerOwn || r.id === 'r1' || r.id === 'r2');

  const filteredOrders = userOrders.filter((order) => {
    if (filterStatus === 'open') return order.status !== 'completed';
    if (filterStatus === 'completed') return order.status === 'completed';
    return true;
  });

  return (
    <div className={`p-3.5 space-y-4 pb-12 ${isDark ? 'text-white' : 'text-black'}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-black'}`}>
            {userMode === 'craftsman' ? 'الطلبات المكشوفة - وضع الحرفي' : 'طلباتي ومتابعة العمل'}
          </h2>
          <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
            {userMode === 'craftsman'
              ? 'جميع أرقام الزبائن التي قمت بكشفها للتواصل والإنجاز'
              : 'متابعة الحرفيين، التقييم النهائي بعد إتمام العمل أو الشكاوى'}
          </p>
        </div>
        <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
          isDark 
            ? 'bg-emerald-950/80 text-white border-emerald-500/40' 
            : 'bg-emerald-100 text-black border-emerald-400 font-extrabold'
        }`}>
          {userOrders.length} طلب
        </span>
      </div>

      {/* Filter Tabs */}
      <div className={`p-1 rounded-xl border flex gap-1 ${
        isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-100 border-gray-300'
      }`}>
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
            filterStatus === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDark
              ? 'text-gray-300 hover:text-white'
              : 'text-black hover:text-emerald-700'
          }`}
        >
          الكل ({userOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('open')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
            filterStatus === 'open'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDark
              ? 'text-gray-300 hover:text-white'
              : 'text-black hover:text-emerald-700'
          }`}
        >
          قيد التنفيذ ({userOrders.filter((r) => r.status !== 'completed').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('completed')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-black transition ${
            filterStatus === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isDark
              ? 'text-gray-300 hover:text-white'
              : 'text-black hover:text-emerald-700'
          }`}
        >
          تم الإنجاز ({userOrders.filter((r) => r.status === 'completed').length})
        </button>
      </div>

      {/* List of Orders */}
      {filteredOrders.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center space-y-3 ${
          isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
        }`}>
          <div className="text-3xl">📋</div>
          <div className="font-black text-sm">
            {userMode === 'craftsman'
              ? 'لم تقم بكشف أي رقم زبون بعد'
              : 'ليس لديك أي طلب منشور حالياً'}
          </div>
          <p className={`text-xs font-bold max-w-xs mx-auto ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
            {userMode === 'craftsman'
              ? 'تصفح الرئيسية واكشف أرقام الزبائن (25 نقطة للطلب) للبدء في الاتصال بهم مباشرة.'
              : 'انشر طلبك وسيتم إشعار أفضل الحرفيين المعتمدين في ولايتك فوراً.'}
          </p>
          {userMode === 'customer' && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs inline-flex items-center gap-1 shadow-xs hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              <span>نشر طلب جديد الآن</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'completed';
            const icon = getCraftIcon(order.craft);
            const cleanPhone = order.phone.replace(/\s+/g, '');
            const existingRating = ratings.find((rt) => rt.requestId === order.id);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border p-4 space-y-3 transition-all ${
                  isDark ? 'bg-[#151928] border-gray-800 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                } ${isCompleted ? 'opacity-90' : ''}`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                        {order.title}
                      </div>
                      <div className={`flex items-center gap-2 text-xs font-bold mt-0.5 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-red-600" />
                          {order.wilaya}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                    isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-amber-500 text-black border-amber-500 font-black shadow-xs'
                  }`}>
                    {isCompleted ? 'مكتمل ✓' : 'قيد الإنجاز'}
                  </span>
                </div>

                {/* Description */}
                <p className={`text-xs font-bold leading-relaxed p-2.5 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800/60 border-gray-700 text-gray-100' 
                    : 'bg-gray-50 border-gray-200 text-black'
                }`}>
                  {order.desc}
                </p>

                {/* Contact Controls */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-black text-xs dir-ltr px-2.5 py-1 rounded-lg border ${
                      isDark 
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                        : 'bg-emerald-50 border-emerald-300 text-black'
                    }`}>
                      {order.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="h-8 px-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1 hover:bg-emerald-700 transition shadow-xs"
                      title="اتصال هاتفي"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال</span>
                    </a>

                    <a
                      href={`https://wa.me/213${cleanPhone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-2.5 rounded-xl bg-[#25D366] text-white font-black text-xs flex items-center gap-1 hover:bg-[#20ba59] transition shadow-xs"
                      title="واتساب"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>واتساب</span>
                    </a>
                  </div>
                </div>

                {/* Action buttons (Complete / Rate / Complain) */}
                <div className={`pt-2 border-t flex items-center justify-between gap-2 flex-wrap ${
                  isDark ? 'border-gray-800' : 'border-gray-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => onToggleCompleteOrder(order.id)}
                    className={`h-8 px-3 rounded-xl border text-xs font-black flex items-center gap-1 transition ${
                      isCompleted
                        ? isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-100 border-gray-300 text-black'
                        : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCompleted ? 'إعادة الفتح' : 'تحديد كمكتمل'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Rate Craftsman */}
                    <button
                      type="button"
                      onClick={() => onOpenRatingModal(order)}
                      className={`h-8 px-2.5 rounded-xl border font-black text-xs flex items-center gap-1 transition ${
                        isDark 
                          ? 'border-amber-500/50 bg-amber-950/40 text-amber-300' 
                          : 'border-amber-300 bg-amber-100 text-black'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{existingRating ? `تقييمك (${existingRating.stars}★)` : 'تقييم الحرفي'}</span>
                    </button>

                    {/* Complaint button */}
                    <button
                      type="button"
                      onClick={() => onOpenComplaintModal(order)}
                      className={`h-8 px-2.5 rounded-xl border font-black text-xs flex items-center gap-1 transition ${
                        isDark 
                          ? 'border-red-500/50 bg-red-950/40 text-red-300' 
                          : 'border-red-300 bg-red-100 text-red-900'
                      }`}
                      title="تقديم شكوى لإدارة المنصة"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>شكوى</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
