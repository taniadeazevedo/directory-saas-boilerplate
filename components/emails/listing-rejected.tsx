import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function ListingRejectedEmail({
  listingTitle,
  reason,
}: {
  listingTitle: string;
  reason?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu listado no fue aprobado</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px" }}>Tu listado necesita cambios</Heading>
          <Text>
            Revisamos <strong>{listingTitle}</strong> y por ahora no cumple
            los criterios de publicación.
          </Text>
          {reason && <Text style={{ color: "#6b7280" }}>Motivo: {reason}</Text>}
          <Text>Puedes editarlo y volver a enviarlo desde tu panel.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ListingRejectedEmail;
