
import { Announcement } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface AnnouncementDisplayProps {
  announcements: Announcement[];
}

const AnnouncementDisplay = ({ announcements }: AnnouncementDisplayProps) => {
  // Sort by urgency first
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const urgencyOrder = { urgent: 0, important: 1, info: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const getAnnouncementVariant = (urgency: Announcement['urgency']) => {
    switch (urgency) {
      case 'urgent':
        return 'destructive';
      case 'important':
        return 'default';
      case 'info':
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-3">
      {sortedAnnouncements.map((announcement) => (
        <Alert
          key={announcement.id}
          variant={getAnnouncementVariant(announcement.urgency)}
        >
          <AlertTitle className="flex items-center gap-2">
            {announcement.title}
            {announcement.urgency === 'urgent' && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-red-200 text-red-800">
                Urgent
              </span>
            )}
          </AlertTitle>
          <AlertDescription>
            <div className="mt-1">{announcement.content}</div>
            {(announcement.effectiveFrom || announcement.effectiveUntil) && (
              <div className="mt-2 text-xs opacity-80">
                {announcement.effectiveFrom && announcement.effectiveUntil ? (
                  <>Valid: {announcement.effectiveFrom} to {announcement.effectiveUntil}</>
                ) : announcement.effectiveFrom ? (
                  <>From: {announcement.effectiveFrom}</>
                ) : (
                  <>Until: {announcement.effectiveUntil}</>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default AnnouncementDisplay;
