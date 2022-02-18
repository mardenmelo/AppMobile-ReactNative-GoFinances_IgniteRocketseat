import React, {useState} from "react";
import { Alert, ActivityIndicator, Platform } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from 'styled-components'

import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';
import { SignInSocialButton } from "../../components/SignInSocialButton";
import { useAuth } from "../../hooks/auth";

import { 
    Container,
    Header,
    TitleWrapper,
    Title,
    SignInTitle,
    Footer,
    FooterWrapper
} from "./styles";


export function SignIn() {
    const [isLoading, SetIsLoading] = useState(false);
    const {signInWithGoogle, signInWithApple} = useAuth();

    const theme = useTheme;

    async function handlesignInWithGoogle() {
        try{
            SetIsLoading(true);
            return await signInWithGoogle();
        } catch (error) {
            console.log(error)
            Alert.alert('Não foi possível conectar a conta Google')
            SetIsLoading(false)
        }
    }

    async function handleSignInWithApple() {
        try {
            SetIsLoading(true);
            return await signInWithApple();
        } catch (error) {
          console.log(error);
          Alert.alert('Não foi possível conectar a conta Apple');
          SetIsLoading(false)
        }
      }

    return (
        <Container>
            <Header>
                <TitleWrapper>
                    <LogoSvg 
                        width={RFValue(120)}
                        height={RFValue(68)}
                    />

                <Title>
                    Controle suas {'\n'}
                    finanças de forma {'\n'}
                    muito simples
                </Title>
                </TitleWrapper>

                <SignInTitle>
                    Faça seu login com {'\n'}
                    uma das contas abaixo
                </SignInTitle>
            </Header>
            <Footer>
                <FooterWrapper>

                    {
                        Platform.OS === "ios" &&
                        <SignInSocialButton 
                            svg={GoogleSvg} 
                            title="Entrar com Google" 
                            onPress={handlesignInWithGoogle} />
                    }
                    <SignInSocialButton 
                        svg={AppleSvg} 
                        title="Entrar com Apple" 
                        onPress={handleSignInWithApple} />

                </FooterWrapper>
                { isLoading && <ActivityIndicator color='white' style={{marginTop: 18}} />}
            </Footer>
        </Container>
    )
}