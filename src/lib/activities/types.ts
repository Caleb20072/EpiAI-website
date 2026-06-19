export interface IActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  registrationDeadline: string;
  isMandatory: boolean;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  registeredCount: number;
  isRegistered?: boolean;
  isPast: boolean;
  canRegister: boolean; // true si deadline pas dépassée
  linkedEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityRegistration {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  registeredBy?: string;
  isForcedRegistration: boolean;
}

export interface IAttendance {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  isPresent: boolean;
  wasRegistered: boolean;
  markedBy: string;
  markedByName: string;
  markedAt: string;
  notes?: string;
}

export interface CreateActivityInput {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  isOnline?: boolean;
  onlineLink?: string;
  isMandatory?: boolean;
}

export interface MarkAttendanceInput {
  userId: string;
  userName: string;
  userEmail: string;
  isPresent: boolean;
  notes?: string;
}

export interface AttendanceReport {
  activityId: string;
  activityTitle: string;
  activityDate: string;
  presentList: IAttendance[];
  absentList: IAttendance[];
  totalPresent: number;
  totalAbsent: number;
}

export interface MemberAttendanceSummary {
  userId: string;
  userName: string;
  userEmail: string;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  details: {
    activityId: string;
    activityTitle: string;
    activityDate: string;
    isPresent: boolean;
    wasRegistered: boolean;
  }[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
