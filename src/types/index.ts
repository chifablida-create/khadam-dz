export interface RequestItem {
  id: string;
  craft: string;
  wilaya: string;
  title: string;
  desc: string;
  phone: string;
  createdAt: number;
  priority?: boolean;
  status?: 'open' | 'in_progress' | 'completed';
  isCustomerOwn?: boolean;
}

export interface CraftsmanUser {
  id: string;
  craft: string;
  name: string;
  phone: string;
  baseAvg: number;
  baseCount: number;
  complaints: number;
  wilaya?: string;
  bio?: string;
  experience?: string;
  isVerified?: boolean;
  isVip?: boolean;
  status?: 'active' | 'suspended';
  points?: number;
}

export interface RatingItem {
  id: string;
  requestId: string;
  craft: string;
  stars: number;
  comment: string;
  createdAt: number;
  customerPhone: string;
  craftsmanName: string;
}

export interface ComplaintItem {
  id: string;
  craftsmanCraft: string;
  craftsmanName: string;
  text: string;
  count: number;
  createdAt: number;
  status?: 'pending' | 'resolved' | 'warned';
  adminNote?: string;
}

export interface ReceiptAnalysisResult {
  paymentService: 'baridimob' | 'chargily' | 'ccp' | 'flexy' | 'other';
  serviceNameAr: string;
  amount: number;
  calculatedPoints: number;
  transactionId?: string;
  senderName?: string;
  senderRipOrPhone?: string;
  recipientRip?: string;
  dateStr?: string;
  status?: string;
  isValidReceipt: boolean;
  confidence: number;
  botNotes: string;
  rawExtractedText?: string;
  autoApproved?: boolean;
}

export interface PendingRecharge {
  id: string;
  user: string;
  phone: string;
  amount: number;
  pts: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  receiptName: string;
  receiptDataUrl?: string;
  mimeType?: string;
  analysis?: ReceiptAnalysisResult;
  autoApproved?: boolean;
}

export interface PointLog {
  id: string;
  type: 'reveal' | 'bonus' | 'recharge';
  pts: number;
  description: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'craftsman' | 'bot';
  text: string;
  ts: number;
}

export interface ChatThread {
  id: string;
  craftsmanId: string;
  craftsmanName: string;
  craft: string;
  phone: string;
  messages: ChatMessage[];
}

export interface PlatformSettings {
  adminPhone: string;
  adminPass: string;
  adminCode: string;
  botAutoApproveReceipts?: boolean;
  botAutoReplyChat?: boolean;
  botAutoVerifyRequests?: boolean;
  botComplaintAutoWarn?: boolean;
  botConfidenceThreshold?: number;
  revealCost?: number;
  welcomeBonus?: number;
  freeRevealPromo?: boolean;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  targetCraft?: string;
  targetWilaya?: string;
  sentAt: number;
  recipientCount: number;
  type?: 'announcement' | 'urgent_request' | 'promo' | 'system';
}

export interface AppNotification {
  id: string;
  type: 'low_points' | 'matching_request' | 'broadcast' | 'system';
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
  relatedRequestId?: string;
  relatedCraft?: string;
  points?: number;
}


