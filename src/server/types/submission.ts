export interface StudentAssessmentItem {
  id: string; // assessmentId
  title: string;
  deadline: string;
  isPastDeadline: boolean;
  createdAt: string;
  module: {
    id: string;
    code: string;
    title: string;
    programme: {
      id: string;
      code: string;
      name: string;
    };
  };
  submission: {
    id: string;
    createdAt: string;
    updatedAt: string;
    latestVersionNumber: number;
    totalVersions: number;
    fileName: string;
    fileSize: number;
    storageKey: string;
    mimeType: string;
    submittedAt: string;
    isLate: boolean;
    lateDurationText: string | null;
    versions: Array<{
      id: string;
      versionNumber: number;
      fileName: string;
      fileSize: number;
      mimeType: string;
      submittedAt: string;
      isLate: boolean;
    }>;
    result?: {
      id: string;
      grade: number;
      isPublished: boolean;
    } | null;
  } | null;
}
