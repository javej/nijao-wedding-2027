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
  guestName: string;
}

export function RsvpConfirmation({ guestName }: RsvpConfirmationProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section>
            <Text style={heading}>We&apos;ve been waiting for you</Text>
            <Text style={paragraph}>
              Dear {guestName},
            </Text>
            <Text style={paragraph}>
              Thank you for confirming your attendance! We are absolutely thrilled
              that you&apos;ll be celebrating this special day with us.
            </Text>
            <Hr style={hr} />
            <Text style={detailsHeading}>Wedding Details</Text>
            <Text style={paragraph}>
              <strong>Date:</strong> January 8, 2027
            </Text>
            <Text style={paragraph}>
              <strong>Church:</strong> St. Therese Parish
            </Text>
            <Text style={paragraph}>
              <strong>Reception:</strong> Casa 10 22, Lipa Batangas
            </Text>
            <Hr style={hr} />
            <Text style={paragraph}>
              We can&apos;t wait to share this beautiful moment with you. Your
              presence means the world to us.
            </Text>
            <Text style={paragraph}>
              With love,
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

const heading = {
  fontSize: "24px",
  fontWeight: "600" as const,
  color: "#2c2c2c",
  textAlign: "center" as const,
  margin: "0 0 24px",
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
