import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface RsvpConfirmationProps {
  /** Full name, used in the greeting. */
  guestName: string;
  /** Available for a more familiar touch; the current copy greets by full name. */
  guestNickname?: string;
}

export function RsvpConfirmation({ guestName }: RsvpConfirmationProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={paragraph}>Dearest {guestName},</Text>
            <Text style={paragraph}>
              This author is simply delighted to share the good news: your attendance is confirmed!
              We are deeply grateful that you will be joining us to gracefully ring in the new year
              and open 2027 by our sides.
            </Text>
            <Hr style={hr} />
            <Text style={detailsHeading}>The Details:</Text>
            <Text style={paragraph}>
              <strong>Date:</strong> January 8, 2027
            </Text>
            <Text style={paragraph}>
              <strong>Ceremony Time:</strong> 1:30 PM prompt
            </Text>
            <Text style={paragraph}>
              <strong>Church:</strong> St. Therese of the Child Jesus and the Holy Face Parish Church
            </Text>
            <Text style={paragraph}>
              <strong>Reception:</strong> 10 22 Lipa (Murraya Hall)
            </Text>
            <Hr style={hr} />
            <Text style={paragraph}>
              Please note that this will be a formal event. Prepare yourselves for an elegant but
              intimate celebration filled with good company, lovely memories, and so much love.
            </Text>
            <Text style={paragraph}>
              With heartfelt gratitude,
              <br />
              Jave &amp; Nianne
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default RsvpConfirmation;

// --- Styles ---

const body = {
  backgroundColor: "#faf9f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "520px",
};

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "600" as const,
  color: "#2c2c2c",
  margin: "0 0 12px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  margin: "0 0 12px",
};

const hr = {
  borderColor: "#e0ddd8",
  margin: "24px 0",
};
