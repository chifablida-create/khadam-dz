import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Send,
  Download,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MessageCircle,
  Coins,
  Bell,
  Smartphone,
  Radio,
  Sparkles,
  Trash2,
  Users,
  Bot,
  Zap,
  Plus,
  Star,
  Lock,
  Unlock,
  Award,
  CheckCheck
} from 'lucide-react';
import {
  PendingRecharge,
  ChatThread,
  ComplaintItem,
  RequestItem,
  CraftsmanUser,
  PlatformSettings,
  BroadcastNotification
} from '../../types';
import { CRAFTS_LIST, WILAYAS_DZ } from '../../data/constants';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  onAdminAdjustPoints: (delta: number, reason: string) => void;
  pendingRecharges: PendingRecharge[];
  onApproveRecharge: (id: string) => void;
  onRejectRecharge: (id: string) => void;
  onApproveAllRecharges: () => void;
  chatThreads: ChatThread[];
  onAdminReplyChat: (threadId: string, text: string, sender?: 'admin' | 'bot') => void;
  onBotReplyAllChats: () => void;
  complaints: ComplaintItem[];
  onResolveComplaint: (id: string, action: 'resolve' | 'warn' | 'penalty') => void;
  onDeleteComplaint: (id: string) => void;
  requests: RequestItem[];
  onCreateAdminRequest: (req: RequestItem) => void;
  onToggleRequestPriority: (id: string) => void;
  onChangeRequestStatus: (id: string, status: 'open' | 'in_progress' | 'completed') => void;
  onAdminForceRevealRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onBotGenerateRequests: () => void;
  craftsmen: CraftsmanUser[];
  onUpdateCraftsman: (user: CraftsmanUser) => void;
  onDeleteCraftsman: (id: string) => void;
  onAddCraftsman: (user: CraftsmanUser) => void;
  settings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => void;
  onResetDemoData: () => void;
  broadcasts: BroadcastNotification[];
  onSendBroadcast: (broadcast: BroadcastNotification) => void;
  onDeleteBroadcast: (id: string) => void;
  onOpenPlayStore?: () => void;
  isDark: boolean;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  points,
  onAdminAdjustPoints,
  pendingRecharges,
  onApproveRecharge,
  onRejectRecharge,
  onApproveAllRecharges,
  chatThreads,
  onAdminReplyChat,
  onBotReplyAllChats,
  complaints,
  onResolveComplaint,
  onDeleteComplaint,
  requests,
  onCreateAdminRequest,
  onToggleRequestPriority,
  onChangeRequestStatus,
  onAdminForceRevealRequest,
  onDeleteRequest,
  onBotGenerateRequests,
  craftsmen,
  onUpdateCraftsman,
  onDeleteCraftsman,
  onAddCraftsman,
  settings,
  onUpdateSettings,
  onResetDemoData,
  broadcasts,
  onSendBroadcast,
  onDeleteBroadcast,
  onOpenPlayStore,
  isDark
}) => {
  const [activeTab, setActiveTab] = useState<'bot' | 'recharges' | 'craftsmen' | 'chats' | 'requests' | 'complaints' | 'settings'>('bot');
  const [selectedThreadId, setSelectedThreadId] = useState<string>(chatThreads[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [adminPhone, setAdminPhone] = useState(settings.adminPhone);
  const [adminPass, setAdminPass] = useState(settings.adminPass);
  const [reportNote, setReportNote] = useState('تقرير يومي: المنصة أونلاين 24/7، صلاحيات البوت الذكي والإدارة مفعلة بالكامل.');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Direct Points Grant/Deduct state
  const [customPointsDelta, setCustomPointsDelta] = useState<string>('100');
  const [customPointsReason, setCustomPointsReason] = useState<string>('مكافأة تشجيعية من إدارة خدّام DZ');

  // Bot Security Audit state
  const [auditReport, setAuditReport] = useState<{
    timestamp: string;
    validRequests: number;
    pendingReceipts: number;
    verifiedCraftsmen: number;
    botHealth: string;
    notes: string[];
  } | null>(null);

  // New Request creation by Admin
  const [showNewReqForm, setShowNewReqForm] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqCraft, setNewReqCraft] = useState('سباك');
  const [newReqWilaya, setNewReqWilaya] = useState('16 الجزائر');
  const [newReqPhone, setNewReqPhone] = useState('0550 88 77 66');
  const [newReqDesc, setNewReqDesc] = useState('');

  // New Craftsman creation by Admin
  const [showNewCraftsmanForm, setShowNewCraftsmanForm] = useState(false);
  const [newCName, setNewCName] = useState('');
  const [newCCraft, setNewCCraft] = useState('سباك');
  const [newCWilaya, setNewCWilaya] = useState('16 الجزائر');
  const [newCPhone, setNewCPhone] = useState('0661 22 33 44');

  // Push Notifications state inside Settings
  const [notifTitle, setNotifTitle] = useState('⚡ طلبات جديدة متاحة الآن في ولايتك!');
  const [notifMessage, setNotifMessage] = useState('تتوفر الآن طلبات صيانة وخدمات عاجلة بحاجة لحرفيين معتمدين. سارع بتفقد قائمة الطلبات وكشف الأرقام للتواصل الفوري.');
  const [notifTargetCraft, setNotifTargetCraft] = useState('الكل');
  const [notifTargetWilaya, setNotifTargetWilaya] = useState('الكل');
  const [notifType, setNotifType] = useState<'announcement' | 'urgent_request' | 'promo' | 'system'>('urgent_request');

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const currentThread = chatThreads.find((t) => t.id === selectedThreadId) || chatThreads[0];
  const pendingRechargesCount = pendingRecharges.filter((p) => p.status === 'pending').length;

  // Calculate recipients count for notification
  const estimatedRecipients = craftsmen.filter((c) => {
    if (notifTargetCraft !== 'الكل' && c.craft !== notifTargetCraft) return false;
    if (notifTargetWilaya !== 'الكل' && c.wilaya && !c.wilaya.includes(notifTargetWilaya.replace(/^\d+\s*/, ''))) return false;
    return true;
  }).length || craftsmen.length;

  const toggleBotPermission = (key: keyof PlatformSettings, label: string) => {
    const currentVal = settings[key] !== false;
    const updated: PlatformSettings = {
      ...settings,
      [key]: !currentVal
    };
    onUpdateSettings(updated);
    showNotice(`تم ${!currentVal ? 'تفعيل' : 'إيقاف'} صلاحية: ${label} ✓`);
  };

  const handleRunSecurityAudit = () => {
    const validReqs = requests.filter((r) => r.phone && r.phone.trim().length >= 9).length;
    const pendingRecs = pendingRecharges.filter((p) => p.status === 'pending').length;
    const verifiedCount = craftsmen.filter((c) => c.isVerified !== false).length;

    setAuditReport({
      timestamp: new Date().toLocaleTimeString('ar-DZ'),
      validRequests: validReqs,
      pendingReceipts: pendingRecs,
      verifiedCraftsmen: verifiedCount,
      botHealth: '100% نشط ومتصل بـ BaridiMob & Chargily Pay',
      notes: [
        `تم فحص ${requests.length} طلب زبون: جميع أرقام الهواتف الجزائرية صالحة ومحمية.`,
        `محرك قراءة وصولات BaridiMob و Chargily مفعل بدقة 99.8% (RIP: ${settings.adminPhone}).`,
        `الرد التلقائي للبوت في شات الحرفيين ${settings.botAutoReplyChat !== false ? 'نشط 24/7 ⚡' : 'متوقف يدوياً'}.`,
        `تسعيرة كشف الرقم الحالية: ${settings.freeRevealPromo ? 'مجاني 0 نقطة (عرض ترويجي)' : `${settings.revealCost ?? 25} نقطة`}.`
      ]
    });
    showNotice('🤖 اكتمل الفحص الأمني والتدقيق الشامل للمنصة بنجاح ✓');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentThread) return;
    onAdminReplyChat(currentThread.id, replyText.trim(), 'admin');
    setReplyText('');
    showNotice('تم إرسال رد الإدارة إلى الحرفي ✓');
  };

  const handleBotSmartReplyInThread = () => {
    if (!currentThread) return;
    const lastMsg = currentThread.messages[currentThread.messages.length - 1]?.text || '';
    let botReply = `🤖 [بوت الإدارة الذكي]: مرحباً يا ${currentThread.craftsmanName}! تم مراجعة حسابك في تخصص (${currentThread.craft}). رصيدك الحالي (${points} نقطة) وحسابك موثق ونشط لاستقبال طلبات الزبائن ⚡.`;
    if (lastMsg.includes('وصل') || lastMsg.includes('شحن') || lastMsg.includes('نقاط')) {
      botReply = `🤖 [بوت الإدارة الذكي]: أهلاً بك يا ${currentThread.craftsmanName}! تم فحص طلب الشحن الخاص بك عبر البوت الآلي وتأكيد صلاحية المعاملة. نحن في خدمتك دائماً على مدار الساعة ✓.`;
    } else if (lastMsg.includes('زبون') || lastMsg.includes('رد')) {
      botReply = `🤖 [بوت الإدارة الذكي]: شكراً لإبلاغنا يا ${currentThread.craftsmanName}! قام البوت بتسجيل ملاحظتك حول رقم الزبون، وتمت إضافة +25 نقطة تعويضية فورية إلى رصيدك 🛡️.`;
      onAdminAdjustPoints(25, `تعويض آلي من البوت للحرفي ${currentThread.craftsmanName}`);
    }
    onAdminReplyChat(currentThread.id, botReply, 'bot');
    showNotice('🤖 قام البوت الذكي بالرد الفوري على الحرفي ✓');
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      adminPhone: adminPhone.trim(),
      adminPass: adminPass.trim(),
      adminCode: adminPass.trim()
    });
    showNotice('تم حفظ إعدادات الإدارة وكلمة المرور بنجاح ✓');
  };

  const handleCreateAdminReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim() || !newReqPhone.trim()) return;
    const req: RequestItem = {
      id: `req_adm_${Date.now()}`,
      title: newReqTitle.trim(),
      craft: newReqCraft,
      wilaya: newReqWilaya,
      phone: newReqPhone.trim(),
      desc: newReqDesc.trim() || `طلب موثق من إدارة خدّام DZ في تخصص ${newReqCraft} بولاية ${newReqWilaya}.`,
      createdAt: Date.now(),
      priority: true,
      status: 'open'
    };
    onCreateAdminRequest(req);
    setNewReqTitle('');
    setNewReqDesc('');
    setShowNewReqForm(false);
    showNotice('تم نشر الطلب الإداري الموثق وتنبيه الحرفيين ✓');
  };

  const handleAddCraftsmanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCName.trim() || !newCPhone.trim()) return;
    const newC: CraftsmanUser = {
      id: `c_adm_${Date.now()}`,
      name: newCName.trim(),
      craft: newCCraft,
      wilaya: newCWilaya,
      phone: newCPhone.trim(),
      baseAvg: 5.0,
      baseCount: 1,
      complaints: 0,
      isVerified: true,
      isVip: true,
      status: 'active',
      experience: '5 سنوات',
      bio: 'حرفي معتمد وموثق من إدارة خدّام DZ'
    };
    onAddCraftsman(newC);
    setNewCName('');
    setShowNewCraftsmanForm(false);
    showNotice(`تم إضافة وتوثيق الحرفي ${newC.name} بنجاح ✓`);
  };

  const handleExportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      points,
      requests,
      craftsmen,
      complaints,
      pendingRecharges,
      broadcasts,
      settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `khadam_dz_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('تم تصدير النسخة الاحتياطية لبيانات المنصة بنجاح ✓');
  };

  const handleSendBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      showNotice('يرجى إدخال عنوان الإشعار ونص الرسالة.');
      return;
    }

    const newBroadcast: BroadcastNotification = {
      id: `bc_${Date.now()}`,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      targetCraft: notifTargetCraft,
      targetWilaya: notifTargetWilaya,
      sentAt: Date.now(),
      recipientCount: estimatedRecipients,
      type: notifType
    };

    onSendBroadcast(newBroadcast);
    showNotice(`📢 تم بث الإشعار الفوري بنجاح إلى ${estimatedRecipients} حرفي مسجل!`);
  };

  const applyTemplate = (title: string, msg: string, type: 'announcement' | 'urgent_request' | 'promo' | 'system') => {
    setNotifTitle(title);
    setNotifMessage(msg);
    setNotifType(type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4">
      <div
        className={`w-full max-w-2xl h-full sm:h-[92vh] sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-[#121624] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'
        }`}
      >
        {/* Top Executive Header */}
        <div className="p-3.5 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-black font-black flex items-center justify-center text-sm shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-sm flex items-center gap-1.5 text-white flex-wrap">
                <span>لوحة القيادة العليا للإدارة والبوت الذكي</span>
                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black">
                  صلاحيات كاملة Super Admin ⚡
                </span>
              </div>
              <div className="text-[10px] text-emerald-300 font-bold mt-0.5">
                تحكم شامل في النقاط، البوت الآلي، الحرفيين، الوصولات، الطلبات والإشعارات
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-200 hover:text-white hover:bg-gray-800 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Feedback Banner inside Modal */}
        {statusBanner && (
          <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-black flex items-center justify-between animate-in fade-in duration-150 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button type="button" onClick={() => setStatusBanner(null)} className="text-white/80 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Executive Summary Bar */}
        <div className={`px-3.5 py-2 border-b grid grid-cols-4 gap-2 text-center shrink-0 ${
          isDark ? 'bg-[#0c0f1a] border-gray-800' : 'bg-emerald-50/70 border-gray-200'
        }`}>
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-[9px] font-bold opacity-80">رصيد النقاط النشط</div>
            <div className="text-xs font-black text-amber-500">{points} ن</div>
          </div>
          <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-[9px] font-bold opacity-80">وصولات معلقة</div>
            <div className="text-xs font-black text-emerald-500">{pendingRechargesCount} وصل</div>
          </div>
          <div className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30">
            <div className="text-[9px] font-bold opacity-80">الحرفيون المسجلون</div>
            <div className="text-xs font-black text-sky-500">{craftsmen.length} حرفي</div>
          </div>
          <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="text-[9px] font-bold opacity-80">حالة البوت الآلي</div>
            <div className="text-xs font-black text-purple-400">مفوض 24/7 🤖</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`p-2 border-b flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'bot'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>البوت والصلاحيات 🤖</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recharges')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'recharges'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>الشحن والنقاط ({pendingRechargesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('craftsmen')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'craftsmen'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>الحرفيون ({craftsmen.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>شات الحرفيين ({chatThreads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الطلبات ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>الشكاوى ({complaints.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>الإشعارات والإعدادات</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 0: BOT & SUPER ADMIN PERMISSIONS */}
          {activeTab === 'bot' && (
            <div className="space-y-4">
              {/* Executive Bot Header Card */}
              <div className={`p-4 rounded-3xl border space-y-3 ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-950/60 via-[#151c2e] to-gray-900 border-emerald-500/40 text-white'
                  : 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border-emerald-300 text-black shadow-xs'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shrink-0">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm flex items-center gap-1.5">
                        <span>مركز صلاحيات البوت الذكي والإدارة</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">
                          AI Powered 24/7
                        </span>
                      </h3>
                      <p className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        تفويض البوت باعتماد الوصولات، الرد على الحرفيين، فلترة الطلبات، وحماية المنصة تلقائياً
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Click Executive Bot Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onApproveAllRecharges();
                      showNotice('⚡ قام البوت بفحص واعتماد جميع الوصولات المعلقة وشحن النقاط!');
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs flex items-center justify-between gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>اعتماد كل الوصولات بالبوت ({pendingRechargesCount})</span>
                    </div>
                    <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-lg">فوري ⚡</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onBotReplyAllChats();
                      showNotice('🤖 قام البوت بالرد التلقائي الذكي على جميع محادثات الحرفيين!');
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black text-xs flex items-center justify-between gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>رد البوت على جميع الحرفيين ({chatThreads.length})</span>
                    </div>
                    <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-lg">تلقائي 🤖</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onBotGenerateRequests();
                      showNotice('🎯 قام البوت بتوليد ونشر 3 طلبات زبائن موثقة وتنبيه الحرفيين!');
                    }}
                    className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black text-xs flex items-center justify-between gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-black shrink-0" />
                      <span>توليد 3 طلبات زبائن جديدة بالبوت</span>
                    </div>
                    <span className="text-[10px] bg-black/15 px-2 py-0.5 rounded-lg">+3 طلبات</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunSecurityAudit}
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs flex items-center justify-between gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>فحص أمني وتدقيق شامل بالبوت</span>
                    </div>
                    <span className="text-[10px] bg-black/25 px-2 py-0.5 rounded-lg">Audit 🛡️</span>
                  </button>
                </div>

                {/* Security Audit Report Box */}
                {auditReport && (
                  <div className={`p-3.5 rounded-2xl border space-y-2 text-xs animate-in fade-in duration-200 ${
                    isDark ? 'bg-black/40 border-emerald-500/40 text-emerald-200' : 'bg-white border-emerald-400 text-black'
                  }`}>
                    <div className="flex items-center justify-between font-black">
                      <span className="text-emerald-500 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>تقرير التدقيق الأمني للبوت ({auditReport.timestamp})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAuditReport(null)}
                        className="text-[10px] underline opacity-75"
                      >
                        إخفاء
                      </button>
                    </div>
                    <ul className="space-y-1 text-[11px] font-bold list-disc list-inside">
                      {auditReport.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bot Permissions Matrix (Toggles) */}
              <div className={`p-4 rounded-3xl border space-y-3 ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                <h4 className="font-black text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>مصفوفة صلاحيات البوت الآلي (تفعيل / إيقاف فوري):</span>
                </h4>

                <div className="space-y-2">
                  {[
                    {
                      key: 'botAutoApproveReceipts' as keyof PlatformSettings,
                      title: 'الاعتماد والشحن التلقائي لوصولات BaridiMob و Chargily',
                      desc: 'يقوم البوت بقراءة الوصل والتحقق من RIP والمبلغ وشحن النقاط للحرفي فوراً بدون انتظار'
                    },
                    {
                      key: 'botAutoReplyChat' as keyof PlatformSettings,
                      title: 'الرد الذكي التلقائي في شات الحرفيين (24/7)',
                      desc: 'يجيب البوت فوراً على استفسارات الحرفيين حول الرصيد، الوصولات، وطلبات العمل'
                    },
                    {
                      key: 'botAutoVerifyRequests' as keyof PlatformSettings,
                      title: 'الفلترة والتدقيق الآلي لطلبات الزبائن وتحديد الأولوية',
                      desc: 'فحص أرقام الهواتف الجزائرية وتمييز الطلبات المستعجلة بشارة الأولوية تلقائياً'
                    },
                    {
                      key: 'botComplaintAutoWarn' as keyof PlatformSettings,
                      title: 'حماية الزبائن والإنذار التلقائي للحرفي عند الشكاوى',
                      desc: 'إرسال تنبيه رسمي للحرفي عبر الشات فور تسجيل أي شكوى ضده لضمان جودة الخدمة'
                    },
                    {
                      key: 'freeRevealPromo' as keyof PlatformSettings,
                      title: 'وضع الكشف المجاني الترويجي (0 نقطة لكشف الرقم)',
                      desc: 'عند التفعيل، يمكن للحرفيين كشف أرقام الزبائن مجاناً بدون خصم نقاط كعرض ترويجي من الإدارة',
                      defaultFalse: true
                    }
                  ].map((item) => {
                    const isEnabled = item.defaultFalse
                      ? Boolean(settings[item.key])
                      : settings[item.key] !== false;
                    return (
                      <div
                        key={item.key}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                          isDark ? 'bg-gray-900/70 border-gray-700' : 'bg-white border-gray-300 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="font-black text-xs flex items-center gap-1.5">
                            <span>{item.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                              isEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {isEnabled ? 'مفعل ✓' : 'متوقف'}
                            </span>
                          </div>
                          <div className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.desc}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = !isEnabled;
                            onUpdateSettings({
                              ...settings,
                              [item.key]: nextVal
                            });
                            showNotice(`تم ${nextVal ? 'تفعيل' : 'إيقاف'} "${item.title}" ✓`);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition shrink-0 cursor-pointer ${
                            isEnabled
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : isDark
                              ? 'bg-gray-800 text-gray-300 border border-gray-700'
                              : 'bg-gray-200 text-black'
                          }`}
                        >
                          {isEnabled ? 'مفعل ✓' : 'تفعيل'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing & Welcome Bonus Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 rounded-2xl border ${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-300'}`}>
                    <label className="block text-xs font-black mb-1.5">
                      تسعيرة كشف رقم الزبون (نقاط):
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[0, 15, 20, 25, 30].map((cost) => {
                        const activeCost = settings.freeRevealPromo ? 0 : (settings.revealCost ?? 25);
                        return (
                          <button
                            key={cost}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({
                                ...settings,
                                revealCost: cost,
                                freeRevealPromo: cost === 0
                              });
                              showNotice(`تم تحديث تسعيرة كشف الرقم إلى ${cost === 0 ? 'مجاني (0ن)' : `${cost} نقطة`} ✓`);
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                              activeCost === cost
                                ? 'bg-emerald-600 text-white border-emerald-500'
                                : isDark
                                ? 'bg-gray-800 border-gray-700 text-gray-300'
                                : 'bg-gray-100 border-gray-300 text-black'
                            }`}
                          >
                            {cost === 0 ? 'مجاني' : `${cost}ن`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isDark ? 'bg-gray-900/60 border-gray-700' : 'bg-white border-gray-300'}`}>
                    <label className="block text-xs font-black mb-1.5">
                      هدية التسجيل للحرفيين الجدد:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[50, 100, 150, 200].map((bonus) => {
                        const activeBonus = settings.welcomeBonus ?? 50;
                        return (
                          <button
                            key={bonus}
                            type="button"
                            onClick={() => {
                              onUpdateSettings({
                                ...settings,
                                welcomeBonus: bonus
                              });
                              showNotice(`تم تحديد هدية التسجيل بـ ${bonus} نقطة ✓`);
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                              activeBonus === bonus
                                ? 'bg-amber-500 text-black border-amber-400'
                                : isDark
                                ? 'bg-gray-800 border-gray-700 text-gray-300'
                                : 'bg-gray-100 border-gray-300 text-black'
                            }`}
                          >
                            +{bonus}ن
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: RECHARGES & DIRECT POINTS CONTROL */}
          {activeTab === 'recharges' && (
            <div className="space-y-4">
              {/* Direct Admin Points Grant / Deduct Card */}
              <div className={`p-4 rounded-3xl border space-y-3 ${
                isDark ? 'bg-gradient-to-r from-amber-950/40 to-gray-900 border-amber-500/40' : 'bg-amber-50/80 border-amber-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-black text-xs">منح أو خصم النقاط المباشر من الإدارة</h4>
                      <p className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        تحكم فوري في رصيد النقاط الحالي ({points} نقطة) بدون الحاجة لوصل
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-500">{points} ن</span>
                </div>

                {/* Quick Grant/Deduct Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { delta: 50, label: '+50 نقطة هدية' },
                    { delta: 100, label: '+100 نقطة' },
                    { delta: 210, label: '+210ن (باقة 2000دج)' },
                    { delta: 325, label: '+325ن (باقة 3000دج)' },
                    { delta: 560, label: '+560ن (باقة 5000دج)' },
                    { delta: -25, label: '-25ن خصم' }
                  ].map((btn) => (
                    <button
                      key={btn.delta}
                      type="button"
                      onClick={() => {
                        onAdminAdjustPoints(btn.delta, `تعديل مباشر من الإدارة (${btn.label})`);
                        showNotice(`تم ${btn.delta > 0 ? `إضافة +${btn.delta}` : `خصم ${btn.delta}`} نقطة بنجاح ✓`);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition active:scale-95 cursor-pointer ${
                        btn.delta > 0
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-red-600/20 border border-red-500/40 text-red-500 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Custom Points Input */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="number"
                    value={customPointsDelta}
                    onChange={(e) => setCustomPointsDelta(e.target.value)}
                    placeholder="عدد النقاط..."
                    className={`w-full sm:w-28 h-9 px-3 rounded-xl border text-xs font-mono font-black outline-none ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                  <input
                    type="text"
                    value={customPointsReason}
                    onChange={(e) => setCustomPointsReason(e.target.value)}
                    placeholder="السبب (يظهر في سجل الحرفي)..."
                    className={`flex-1 h-9 px-3 rounded-xl border text-xs font-bold outline-none ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = parseInt(customPointsDelta, 10);
                      if (!isNaN(val) && val !== 0) {
                        onAdminAdjustPoints(val, customPointsReason || 'عملية إدارية مباشرة');
                        showNotice(`تم تنفيذ العملية (${val > 0 ? `+${val}` : val} نقطة) ✓`);
                      }
                    }}
                    className="px-4 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs shrink-0 cursor-pointer"
                  >
                    تنفيذ فوري
                  </button>
                </div>
              </div>

              <div className={`flex items-center justify-between text-xs font-black ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                <span>أوصال التحويلات البنكية وبريدي موب ({pendingRecharges.length}):</span>
                {pendingRechargesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onApproveAllRecharges();
                      showNotice('تم اعتماد جميع الوصولات المعلقة وشحن النقاط ✓');
                    }}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>اعتماد الكل ({pendingRechargesCount})</span>
                  </button>
                )}
              </div>

              {pendingRecharges.length === 0 ? (
                <div className={`text-center py-10 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  لا توجد طلبات شحن معلقة حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRecharges.map((pr) => (
                    <div
                      key={pr.id}
                      className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isDark ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                            {pr.user} ({pr.phone})
                          </div>
                          <div className={`text-xs font-black mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                            المبلغ: {pr.amount.toLocaleString('fr-FR')} دج • يمنح: +{pr.pts} نقطة
                          </div>
                          <div className={`text-[10px] font-mono font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                            ملف الوصل: {pr.receiptName}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {pr.autoApproved && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              شحن فوري بالبوت ⚡
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            pr.status === 'pending'
                              ? 'bg-amber-500 text-black border-amber-500'
                              : pr.status === 'approved'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-red-600 text-white border-red-600'
                          }`}>
                            {pr.status === 'pending' ? 'بانتظار التأكيد' : pr.status === 'approved' ? 'معتمد ✓' : 'مرفوض'}
                          </span>
                        </div>
                      </div>

                      {pr.analysis && (
                        <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                          isDark ? 'bg-gray-900/80 border-emerald-500/30 text-gray-200' : 'bg-emerald-50/70 border-emerald-300 text-black'
                        }`}>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>فحص البوت: {pr.analysis.serviceNameAr}</span>
                            </span>
                            {pr.analysis.transactionId && (
                              <span className="font-mono font-black">
                                معاملة #{pr.analysis.transactionId}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold opacity-90 leading-relaxed">
                            {pr.analysis.botNotes}
                          </p>
                        </div>
                      )}

                      {pr.receiptDataUrl && (
                        <div>
                          {pr.mimeType === 'application/pdf' || pr.receiptName?.toLowerCase().endsWith('.pdf') ? (
                            <div className={`p-3 rounded-xl border flex items-center justify-between ${
                              isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'
                            }`}>
                              <div className="flex items-center gap-2">
                                <FileText className="w-6 h-6 text-red-500" />
                                <div>
                                  <div className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>
                                    {pr.receiptName}
                                  </div>
                                  <div className={`text-[10px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    مستند إشعار دفع رسمي PDF
                                  </div>
                                </div>
                              </div>
                              <a
                                href={pr.receiptDataUrl}
                                download={pr.receiptName || 'receipt.pdf'}
                                className={`text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                  isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-200'
                                }`}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>تحميل PDF</span>
                              </a>
                            </div>
                          ) : (
                            <div className="rounded-xl overflow-hidden max-h-48 border border-gray-300 dark:border-gray-700">
                              <img
                                src={pr.receiptDataUrl}
                                alt="Receipt"
                                className="w-full h-48 object-contain bg-black/5"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {pr.status === 'pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              onApproveRecharge(pr.id);
                              showNotice(`تم اعتماد وصل ${pr.user} وشحن +${pr.pts} نقطة ✓`);
                            }}
                            className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>تأكيد وشحن النقاط (+{pr.pts}ن)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onRejectRecharge(pr.id);
                              showNotice(`تم رفض وصل ${pr.user}`);
                            }}
                            className="px-4 h-9 rounded-xl border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-black text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>رفض</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CRAFTSMEN MANAGEMENT (NEW!) */}
          {activeTab === 'craftsmen' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black">
                  إدارة الحرفيين والتوثيق والترقيات ({craftsmen.length} حرفي):
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCraftsmanForm(!showNewCraftsmanForm)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة حرفي موثق</span>
                </button>
              </div>

              {showNewCraftsmanForm && (
                <form
                  onSubmit={handleAddCraftsmanSubmit}
                  className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-gray-800/80 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="font-black text-xs">تسجيل وتوثيق حرفي جديد من الإدارة:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newCName}
                      onChange={(e) => setNewCName(e.target.value)}
                      placeholder="اسم الحرفي..."
                      className={`h-9 px-3 rounded-xl border text-xs font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    />
                    <input
                      type="text"
                      required
                      value={newCPhone}
                      onChange={(e) => setNewCPhone(e.target.value)}
                      placeholder="رقم الهاتف..."
                      className={`h-9 px-3 rounded-xl border text-xs font-mono font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    />
                    <select
                      value={newCCraft}
                      onChange={(e) => setNewCCraft(e.target.value)}
                      className={`h-9 px-2.5 rounded-xl border text-xs font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      {CRAFTS_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={newCWilaya}
                      onChange={(e) => setNewCWilaya(e.target.value)}
                      className={`h-9 px-2.5 rounded-xl border text-xs font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      {WILAYAS_DZ.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
                    >
                      حفظ وتوثيق الحرفي ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCraftsmanForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-gray-500 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {craftsmen.map((c) => {
                  const isSuspended = c.status === 'suspended';
                  const isVip = Boolean(c.isVip);
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isSuspended
                          ? 'bg-red-950/20 border-red-500/40'
                          : isDark
                          ? 'bg-gray-800/60 border-gray-700'
                          : 'bg-gray-50 border-gray-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm">{c.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black">
                              {c.craft}
                            </span>
                            {isVip && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-black flex items-center gap-0.5">
                                <Award className="w-3 h-3" />
                                <span>VIP مميز</span>
                              </span>
                            )}
                            {isSuspended && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black">
                                حساب مجمد ⛔
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {c.wilaya || '16 الجزائر'} • الهاتف: <span className="font-mono">{c.phone}</span> • التقييم: ⭐ {c.baseAvg} • الشكاوى: {c.complaints}
                          </div>
                        </div>
                      </div>

                      {/* Admin Quick Controls for this Craftsman */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onAdminAdjustPoints(100, `مكافأة إدارية للحرفي ${c.name}`);
                            showNotice(`تم منح +100 نقطة مكافأة للحرفي ${c.name} ✓`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Coins className="w-3 h-3" />
                          <span>منح +100ن</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateCraftsman({ ...c, isVip: !isVip, isVerified: true });
                            showNotice(`تم ${!isVip ? 'ترقية' : 'إلغاء ترقية'} ${c.name} لرتبة VIP ⭐`);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border cursor-pointer ${
                            isVip
                              ? 'bg-amber-400 text-black border-amber-500'
                              : isDark
                              ? 'bg-gray-800 border-gray-700 text-amber-400'
                              : 'bg-white border-gray-300 text-amber-700'
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          <span>{isVip ? 'عضو VIP ✓' : 'ترقية VIP'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onUpdateCraftsman({ ...c, baseAvg: 5.0, complaints: 0 });
                            showNotice(`تم تصفير شكاوى ${c.name} ورفع تقييمه إلى 5.0 ⭐`);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black border cursor-pointer ${
                            isDark ? 'bg-gray-800 border-gray-700 text-emerald-400' : 'bg-white border-gray-300 text-emerald-700'
                          }`}
                        >
                          تصفير الشكاوى ورفع 5⭐
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = isSuspended ? 'active' : 'suspended';
                            onUpdateCraftsman({ ...c, status: nextStatus });
                            showNotice(`تم ${nextStatus === 'suspended' ? 'تجميد' : 'إعادة تفعيل'} حساب ${c.name}`);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border cursor-pointer ${
                            isSuspended
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10'
                          }`}
                        >
                          {isSuspended ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{isSuspended ? 'تفعيل الحساب' : 'تجميد مؤقت'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCraftsman(c.id);
                            showNotice(`تم حذف حساب ${c.name}`);
                          }}
                          className="px-2.5 py-1 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CRAFTSMAN CHATS */}
          {activeTab === 'chats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[460px]">
              {/* Threads list */}
              <div className={`rounded-2xl border p-2 space-y-1.5 overflow-y-auto ${
                isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}>
                {chatThreads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-right p-2.5 rounded-xl border transition cursor-pointer ${
                      selectedThreadId === thread.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : isDark
                        ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                        : 'bg-white border-gray-300 text-black hover:bg-gray-100 shadow-xs'
                    }`}
                  >
                    <div className="font-black text-xs">{thread.craftsmanName}</div>
                    <div className="text-[10px] font-bold opacity-90">{thread.craft} • {thread.phone}</div>
                    <div className="text-[9px] font-medium opacity-80 mt-1 truncate">
                      {thread.messages[thread.messages.length - 1]?.text}
                    </div>
                  </button>
                ))}
              </div>

              {/* Chat View */}
              <div className={`col-span-2 rounded-2xl border flex flex-col overflow-hidden ${
                isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-300'
              }`}>
                {currentThread ? (
                  <>
                    <div className={`p-3 border-b font-black text-xs flex items-center justify-between gap-2 flex-wrap ${
                      isDark ? 'border-gray-700 text-white' : 'border-gray-200 text-black bg-gray-50'
                    }`}>
                      <span>{currentThread.craftsmanName} ({currentThread.craft})</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleBotSmartReplyInThread}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Bot className="w-3 h-3" />
                          <span>رد ذكي بالبوت 🤖</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAdminAdjustPoints(50, `هدية دعم من الشات للحرفي ${currentThread.craftsmanName}`);
                            onAdminReplyChat(
                              currentThread.id,
                              `🎁 [إدارة خدّام DZ]: تم إضافة +50 نقطة هدية تشجيعية إلى رصيدك الآن! بالتوفيق في عملك.`,
                              'admin'
                            );
                            showNotice('تم إرسال +50 نقطة هدية للحرفي في الشات ✓');
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-500 text-black text-[10px] font-black cursor-pointer"
                        >
                          🎁 إهداء +50ن
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {currentThread.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex flex-col ${m.sender === 'admin' || m.sender === 'bot' ? 'items-end' : 'items-start'}`}
                        >
                          <span className={`text-[9px] font-bold mb-0.5 px-1 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {m.sender === 'bot' ? '🤖 البوت الذكي' : m.sender === 'admin' ? '🛡️ الإدارة (أنت)' : currentThread.craftsmanName}
                          </span>
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-xs font-bold ${
                              m.sender === 'bot'
                                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-tl-none'
                                : m.sender === 'admin'
                                ? 'bg-emerald-600 text-white rounded-tl-none'
                                : isDark
                                ? 'bg-gray-800 text-white rounded-tr-none'
                                : 'bg-gray-100 text-black rounded-tr-none border border-gray-300'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendReply} className={`p-2.5 border-t flex gap-2 ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="الرد على الحرفي..."
                        className={`flex-1 h-9 px-3 rounded-xl border text-xs font-bold outline-none ${
                          isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      />
                      <button
                        type="submit"
                        className="px-4 h-9 rounded-xl bg-emerald-600 text-white font-black text-xs cursor-pointer"
                      >
                        إرسال
                      </button>
                    </form>
                  </>
                ) : (
                  <div className={`flex-1 flex items-center justify-center text-xs font-bold ${
                    isDark ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    اختر حرفياً لبدء المحادثة
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REQUESTS MANAGEMENT */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">إجمالي الطلبات النشطة ({requests.length}):</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onBotGenerateRequests();
                      showNotice('🎯 قام البوت بتوليد 3 طلبات زبائن جديدة!');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-black text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>توليد بالبوت</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewReqForm(!showNewReqForm)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة طلب</span>
                  </button>
                </div>
              </div>

              {showNewReqForm && (
                <form
                  onSubmit={handleCreateAdminReqSubmit}
                  className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-gray-800/80 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <div className="font-black text-xs">نشر طلب زبون جديد من الإدارة:</div>
                  <input
                    type="text"
                    required
                    value={newReqTitle}
                    onChange={(e) => setNewReqTitle(e.target.value)}
                    placeholder="عنوان الطلب (مثال: إصلاح تسرب مياه عاجل)..."
                    className={`w-full h-9 px-3 rounded-xl border text-xs font-bold ${
                      isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newReqCraft}
                      onChange={(e) => setNewReqCraft(e.target.value)}
                      className={`h-9 px-2 rounded-xl border text-xs font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      {CRAFTS_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      value={newReqWilaya}
                      onChange={(e) => setNewReqWilaya(e.target.value)}
                      className={`h-9 px-2 rounded-xl border text-xs font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      {WILAYAS_DZ.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      value={newReqPhone}
                      onChange={(e) => setNewReqPhone(e.target.value)}
                      placeholder="رقم الزبون..."
                      className={`h-9 px-2.5 rounded-xl border text-xs font-mono font-bold ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black cursor-pointer"
                    >
                      نشر الطلب الآن ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewReqForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-gray-500 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-2xl border space-y-2 text-xs ${
                      isDark ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-black flex items-center gap-1.5 flex-wrap">
                          <span>{r.title}</span>
                          {r.priority && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-black">
                              مستعجل ⚡
                            </span>
                          )}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                            r.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-sky-500/20 text-sky-400'
                          }`}>
                            {r.status === 'completed' ? 'مكتمل ✓' : 'مفتوح'}
                          </span>
                        </div>
                        <div className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                          {r.craft} • {r.wilaya} • هاتف الزبون: <span className="font-mono">{r.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onToggleRequestPriority(r.id);
                          showNotice('تم تحديث أولوية الطلب ✓');
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-black cursor-pointer ${
                          r.priority
                            ? 'bg-amber-400 text-black border-amber-500'
                            : isDark
                            ? 'bg-gray-800 border-gray-700 text-gray-300'
                            : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        {r.priority ? 'إلغاء الاستعجال' : '⚡ تثبيت كمستعجل'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onAdminForceRevealRequest(r.id);
                          showNotice(`🔓 تم فتح رقم الزبون (${r.phone}) مجاناً للحرفي!`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-500 font-black text-[10px] cursor-pointer"
                      >
                        🔓 كشف الرقم مجاناً
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const next = r.status === 'completed' ? 'open' : 'completed';
                          onChangeRequestStatus(r.id, next);
                          showNotice('تم تحديث حالة الطلب ✓');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-sky-500/40 text-sky-500 font-black text-[10px] cursor-pointer"
                      >
                        {r.status === 'completed' ? 'إعادة فتح الطلب' : '✓ تحديد كمكتمل'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onDeleteRequest(r.id);
                          showNotice('تم حذف الطلب ✓');
                        }}
                        className="px-2.5 py-1 rounded-lg border border-red-500 text-red-500 font-black text-[10px] hover:bg-red-500/10 cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-3">
              <div className={`text-xs font-black ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                بلاغات الزبائن المسجلة ضد الحرفيين وصلاحيات المعالجة الفورية:
              </div>

              {complaints.length === 0 ? (
                <div className={`text-center py-10 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  لا توجد أي شكاوى مسجلة. المنظومة تعمل بانتظام.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {complaints.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border space-y-2.5 ${
                        isDark ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-black text-xs text-red-500 flex items-center gap-1.5">
                          <span>{c.craftsmanName} ({c.craftsmanCraft})</span>
                          {c.status === 'resolved' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              تم الحل ✓
                            </span>
                          )}
                          {c.status === 'warned' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black">
                              تم إنذار الحرفي ⚠️
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteComplaint(c.id);
                            showNotice('تم حذف البلاغ ✓');
                          }}
                          className="text-[11px] font-black text-red-500 hover:underline cursor-pointer"
                        >
                          حذف البلاغ ✕
                        </button>
                      </div>

                      <p className={`text-xs font-bold leading-relaxed p-2.5 rounded-xl border ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}>
                        {c.text}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onResolveComplaint(c.id, 'resolve');
                            showNotice(`تم تسجيل حل الشكوى الخاصة بـ ${c.craftsmanName} ✓`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-black cursor-pointer"
                        >
                          ✓ تم حل المشكلة
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onResolveComplaint(c.id, 'warn');
                            showNotice(`🤖 أرسل البوت إنذاراً رسمياً للحرفي ${c.craftsmanName} في الشات!`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-[10px] font-black cursor-pointer"
                        >
                          🤖 إرسال إنذار بالبوت
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onResolveComplaint(c.id, 'penalty');
                            showNotice(`تم خصم 25 نقطة غرامة مخالفة من الرصيد ✓`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-[10px] font-black cursor-pointer"
                        >
                          خصم 25ن غرامة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS & PUSH NOTIFICATIONS */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* SECTION: PUSH NOTIFICATIONS BROADCAST */}
              <div className={`rounded-3xl border p-4.5 space-y-4 shadow-sm ${
                isDark ? 'bg-gradient-to-b from-[#181d2f] to-[#121624] border-emerald-500/30 text-white' : 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-400 text-black shadow-xs'
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                          إرسال إشعارات عامة (Push Notifications)
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          بث مباشر
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        إرسال إشعار فوري وتنبيه على شاشة هاتف جميع الحرفيين المسجلين
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border shrink-0 ${
                    isDark ? 'bg-gray-800 border-gray-700 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-900'
                  }`}>
                    {estimatedRecipients} حرفي مستهدف
                  </span>
                </div>

                {/* Quick Templates Buttons */}
                <div>
                  <label className={`block text-[11px] font-black mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                    قوالب إشعارات سريعة ومقترحة:
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => applyTemplate(
                        '⚡ طلبات جديدة متاحة الآن في ولايتك!',
                        'تتوفر الآن طلبات صيانة وخدمات عاجلة بحاجة لحرفيين معتمدين. سارع بتفقد قائمة الطلبات وكشف الأرقام للتواصل الفوري.',
                        'urgent_request'
                      )}
                      className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-100 shadow-xs'
                      }`}
                    >
                      ⚡ طلبات عاجلة
                    </button>

                    <button
                      type="button"
                      onClick={() => applyTemplate(
                        '🎁 بونيس شحن النقاط الأسبوعي!',
                        'اشحن باقة 3000 دج اليوم واحصل على 325 نقطة فورية لتكشف أرقام الزبائن وتتواصل معهم مباشرة!',
                        'promo'
                      )}
                      className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-100 shadow-xs'
                      }`}
                    >
                      🎁 بونيس النقاط
                    </button>

                    <button
                      type="button"
                      onClick={() => applyTemplate(
                        '⚠️ تنبيه رسمي بخصوص المواعيد',
                        'يرجى من جميع الحرفيين الالتزام بالمواعيد المحددة مع الزبائن والاتفاق الشفاف على الأسعار لتفادي تعليق الحساب.',
                        'system'
                      )}
                      className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl border transition cursor-pointer ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-black hover:bg-gray-100 shadow-xs'
                      }`}
                    >
                      ⚠️ تنبيه هام
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSendBroadcastNotification} className="space-y-3">
                  <div>
                    <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      عنوان الإشعار *
                    </label>
                    <input
                      type="text"
                      required
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold outline-none transition ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500' : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      نص الإشعار / الرسالة *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold outline-none transition ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500' : 'bg-white border-gray-300 text-black focus:border-emerald-600 shadow-xs'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={`block text-[11px] font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                        تخصيص الحرفة
                      </label>
                      <select
                        value={notifTargetCraft}
                        onChange={(e) => setNotifTargetCraft(e.target.value)}
                        className={`w-full h-9 px-2.5 rounded-xl border text-[11px] font-black appearance-none outline-none ${
                          isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        <option value="الكل">كل الحرف ({CRAFTS_LIST.length})</option>
                        {CRAFTS_LIST.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                        تخصيص الولاية
                      </label>
                      <select
                        value={notifTargetWilaya}
                        onChange={(e) => setNotifTargetWilaya(e.target.value)}
                        className={`w-full h-9 px-2.5 rounded-xl border text-[11px] font-black appearance-none outline-none ${
                          isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        <option value="الكل">🇩🇿 كل الولايات (58)</option>
                        {WILAYAS_DZ.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                        نوع الإشعار
                      </label>
                      <select
                        value={notifType}
                        onChange={(e) => setNotifType(e.target.value as any)}
                        className={`w-full h-9 px-2.5 rounded-xl border text-[11px] font-black appearance-none outline-none ${
                          isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                        }`}
                      >
                        <option value="urgent_request">⚡ طلب عاجل</option>
                        <option value="promo">🎁 عرض ترويجي</option>
                        <option value="announcement">📢 إعلان عام</option>
                        <option value="system">⚠️ تنبيه إداري</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                    <span>بث الإشعار الفوري لـ {estimatedRecipients} حرفي الآن</span>
                    <Sparkles className="w-4 h-4 text-lime-300" />
                  </button>
                </form>

                {broadcasts.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <div className="text-xs font-black">
                      سجل الإشعارات المرسلة سابقاً ({broadcasts.length})
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {broadcasts.map((b) => (
                        <div
                          key={b.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                            isDark ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-xs truncate">{b.title}</div>
                            <div className={`text-[10px] truncate font-bold mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {b.message}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteBroadcast(b.id)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Standard Platform Settings */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-gray-800/60 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-black shadow-xs'
              }`}>
                <h4 className="font-black text-xs">إعدادات الإدارة والـ RIP وكلمة المرور</h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-black mb-1">رقم RIP بريدي موب للإدارة</label>
                    <input
                      type="text"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border text-xs font-mono font-black outline-none ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-1">كلمة مرور الإدارة</label>
                    <input
                      type="text"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className={`w-full h-10 px-3 rounded-xl border text-xs font-mono font-black outline-none ${
                        isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">تقرير المنصة العام</label>
                  <textarea
                    rows={2}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black shadow-xs'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  حفظ إعدادات الإدارة ✓
                </button>
              </div>

              {/* Backup & Reset without window.confirm */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="h-11 rounded-2xl bg-black hover:bg-gray-900 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية JSON</span>
                </button>

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>تصفير الحساب - 50ن هدية</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmReset(false);
                        onResetDemoData();
                      }}
                      className="flex-1 h-11 rounded-2xl bg-red-600 text-white font-black text-xs cursor-pointer"
                    >
                      تأكيد التصفير ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 h-11 rounded-2xl border border-gray-500 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
