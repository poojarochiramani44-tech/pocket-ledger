import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE, SIZE } from "baseui/modal";
import { Button, KIND, SHAPE } from "baseui/button";
import { Textarea } from "baseui/textarea";
import { LabelMedium, ParagraphSmall, HeadingSmall } from "baseui/typography";
import { useStyletron } from "baseui";
const Star = ({ size = 24, fill = "none", color = "currentColor" }: { size?: number; fill?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const ThumbsUp = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l4-9a2 2 0 0 1 2 2v2.88Z" />
  </svg>
);
const ThumbsDown = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-4 9a2 2 0 0 1-2-2v-2.88Z" />
  </svg>
);

type Vote = "up" | "down" | null;

interface TripReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    rating: number;
    findability: Vote;
    merchant: Vote;
    storeLocation: Vote;
    feedback: string;
  }) => void;
}

const criteria: { key: "findability" | "merchant" | "storeLocation"; label: string }[] = [
  { key: "findability", label: "Item findability" },
  { key: "merchant", label: "Merchant experience" },
  { key: "storeLocation", label: "Easy to find store" },
];

const TripReviewModal = ({ isOpen, onClose, onSubmit }: TripReviewModalProps) => {
  const [css, theme] = useStyletron();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [votes, setVotes] = useState<Record<string, Vote>>({
    findability: null,
    merchant: null,
    storeLocation: null,
  });
  const [feedback, setFeedback] = useState("");

  const canSubmit = rating > 0;

  const handleSubmit = () => {
    onSubmit?.({
      rating,
      findability: votes.findability,
      merchant: votes.merchant,
      storeLocation: votes.storeLocation,
      feedback: feedback.trim().slice(0, 1000),
    });
    setRating(0);
    setHoverRating(0);
    setVotes({ findability: null, merchant: null, storeLocation: null });
    setFeedback("");
    onClose();
  };

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
    >
      <ModalHeader>How was your trip?</ModalHeader>
      <ModalBody>
        <ParagraphSmall color={theme.colors.contentSecondary} marginTop="0">
          Your feedback helps us improve the experience.
        </ParagraphSmall>

        <div className={css({ marginTop: theme.sizing.scale600 })}>
          <LabelMedium marginBottom={theme.sizing.scale400}>Overall rating</LabelMedium>
          <div className={css({ display: "flex", gap: theme.sizing.scale200 })}>
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = (hoverRating || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className={css({
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: theme.sizing.scale200,
                    display: "flex",
                  })}
                >
                  <Star
                    size={32}
                    fill={filled ? theme.colors.warning400 : "none"}
                    color={filled ? theme.colors.warning400 : theme.colors.contentTertiary}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className={css({ marginTop: theme.sizing.scale800 })}>
          <LabelMedium marginBottom={theme.sizing.scale400}>Tell us about</LabelMedium>
          <div className={css({ display: "flex", flexDirection: "column", gap: theme.sizing.scale400 })}>
            {criteria.map(({ key, label }) => (
              <div
                key={key}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.sizing.scale400,
                })}
              >
                <LabelMedium>{label}</LabelMedium>
                <div className={css({ display: "flex", gap: theme.sizing.scale300 })}>
                  <Button
                    kind={votes[key] === "up" ? KIND.primary : KIND.secondary}
                    shape={SHAPE.circle}
                    size="compact"
                    onClick={() =>
                      setVotes((v) => ({ ...v, [key]: v[key] === "up" ? null : "up" }))
                    }
                    aria-label={`${label} thumbs up`}
                  >
                    <ThumbsUp size={16} />
                  </Button>
                  <Button
                    kind={votes[key] === "down" ? KIND.primary : KIND.secondary}
                    shape={SHAPE.circle}
                    size="compact"
                    onClick={() =>
                      setVotes((v) => ({ ...v, [key]: v[key] === "down" ? null : "down" }))
                    }
                    aria-label={`${label} thumbs down`}
                  >
                    <ThumbsDown size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={css({ marginTop: theme.sizing.scale800 })}>
          <LabelMedium marginBottom={theme.sizing.scale400}>
            Additional feedback <span className={css({ color: theme.colors.contentTertiary })}>(optional)</span>
          </LabelMedium>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.currentTarget.value)}
            placeholder="Share anything else about your trip…"
            maxLength={1000}
            clearable
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <ModalButton kind={KIND.tertiary} onClick={onClose}>
          Cancel
        </ModalButton>
        <ModalButton onClick={handleSubmit} disabled={!canSubmit}>
          Send feedback
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default TripReviewModal;
