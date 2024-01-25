import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  userMail?: string;
}

const baseUrl = "https://demo.react.email";
const pageUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const LoginEmail = ({ userMail }: EmailProps) => {
  // const formattedDate = new Intl.DateTimeFormat("en", {
  //   dateStyle: "long",
  //   timeStyle: "short",
  // }).format(loginDate);

  return (
    <Html>
      <Head />
      <Preview>Talkative Login</Preview>
      <Body style={main}>
        <Container>
          {/*<Section style={logo}>
            <Img src={`${pageUrl}/sec_logo_sm.png`} />
          </Section> */}

          <Section style={content}>
            {/*<Img width={620} src={`${pageUrl}/main_logo.png`} /> */}

            <Row style={{ ...boxInfos, paddingBottom: "0" }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 32,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Hey there,
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  You have a new request on Talkative Messenger
                </Heading>

                <Text style={paragraph}>
                  {`${userMail} is willing to have a conversation with you on Talkative, signup using your google account and start talking🗣️`}
                </Text>
              </Column>
            </Row>
            <Row style={{ ...boxInfos, paddingTop: "0" }}>
              <Column style={containerButton} colSpan={2}>
                <Button href="http://localhost:3000/login" style={button}>
                  Signup here
                </Button>
              </Column>
            </Row>
          </Section>

          <Section style={containerImageFooter}>
            <Img width={620} src={`${baseUrl}/static/yelp-footer.png`} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LoginEmail;

const main = {
  backgroundColor: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const logo = {
  padding: "30px 20px",
};

const containerButton = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const button = {
  backgroundColor: "#e00707",
  padding: "12px 30px",
  borderRadius: 3,
  color: "#FFF",
  fontWeight: "bold",
  border: "1px solid rgb(0,0,0, 0.1)",
  cursor: "pointer",
};

const content = {
  border: "1px solid rgb(0,0,0, 0.1)",
  borderRadius: "3px",
  overflow: "hidden",
};

const boxInfos = {
  padding: "20px 40px",
};

const containerImageFooter = {
  padding: "45px 0 0 0",
};
