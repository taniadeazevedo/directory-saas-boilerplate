import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido/a al directorio</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f6f6f6" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
          <Heading style={{ fontSize: "20px" }}>Hola {name} 👋</Heading>
          <Text>
            Gracias por crear tu cuenta. Ya puedes publicar tu primer listado y
            empezar a recibir tráfico cualificado desde el directorio.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
