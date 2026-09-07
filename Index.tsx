import { useState } from "react";
import { useStyletron } from "baseui";
import { Button } from "baseui/button";
import { HeadingXLarge, ParagraphMedium } from "baseui/typography";
import TripReviewModal from "@/components/TripReviewModal";

const Index = () => {
  const [css, theme] = useStyletron();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={css({
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.backgroundPrimary,
        padding: theme.sizing.scale800,
      })}
    >
      <div className={css({ textAlign: "center", maxWidth: "600px" })}>
        <HeadingXLarge overrides={{ Block: { style: { marginBottom: theme.sizing.scale600 } } }}>Trip complete</HeadingXLarge>
        <ParagraphMedium
          overrides={{
            Block: { style: { color: theme.colors.contentSecondary, marginBottom: theme.sizing.scale800 } },
          }}
        >
          Let us know how your shopping trip went.
        </ParagraphMedium>
        <Button onClick={() => setOpen(true)}>Rate your trip</Button>
      </div>
      <TripReviewModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default Index;
