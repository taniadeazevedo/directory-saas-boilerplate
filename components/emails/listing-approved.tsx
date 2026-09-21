import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function ListingApprovedEmail({
  listingTitle,
  listingUrl,
}: {
  listingTitle: string;
  listingUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Tu listado fue aprobado</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px" }}>¡Buenas noticias! 🎉</Heading>
          <Text>
            Tu listado <strong>{listingTitle}</strong> fue revisado y ya está
            publicado en el directorio.
          </Text>
          <Button
            href={listingUrl}
            style={{
              backgroundColor: "#111827",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "6px",
              textDecoration: "none",
            }}
          >
            Ver mi listado
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export default ListingApprovedEmail;
