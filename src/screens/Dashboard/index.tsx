import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HighlightCard } from "../../components/HighlightCard";
import { TransactionCard, TransactionCardProps } from "../../components/TransactionCard";

import {
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer,
    } from './styles'
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "styled-components";
import { LastTransaction } from "../../components/HighlightCard/styles";
import { useAuth } from "../../hooks/auth";

export interface DataListProps extends TransactionCardProps {
    id: string;
}

interface HighlightProps {
    total: string;
    lastTransaction: string;
}

interface HighlightData {
    entries: HighlightProps;
    expansives: HighlightProps;
    total: HighlightProps;
}

export function Dashboard() {

    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

    const theme = useTheme();
    const {signOut, user} = useAuth();

    function getLastTransactionDate(collection: DataListProps[], type: 'positive' | 'negative') {

        // Tranformação de datas e colocando em ordem
        const lastTransaction = new Date (Math.max.apply(Math, collection
            .filter(transaction => transaction.type === type)
            .map(transaction => new Date(transaction.date).getTime())))
    
            // return Intl
            // .DateTimeFormat('pt-BR', {lp
            //     day: "2-digit",
            //     month: "2-digit",
            //     year: "2-digit"
            // }).format(new Date(lastTransaction))

            return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', {
                month: "long"
            })}`

        }

    async function loadTransactions() {
        const dataKey = `@gofinances:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey)
        const transactions = response ? JSON.parse(response) : []

        let entriesTotal = 0
        let expensiveTotal = 0

        // Percorre cada item e formata
        const transactionsFormatted: DataListProps[] = transactions
        .map((item: DataListProps) => {

            if(item.type === 'positive'){
                entriesTotal += Number(item.amount)
            } else {
                expensiveTotal += Number(item.amount)
            }

            const amount = Number(item.amount)
            .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })
           
            const date = Intl.DateTimeFormat('pt-BR', {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit"
            }).format(new Date(item.date))

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date,
            }
        })

        setTransactions(transactionsFormatted);

        const lastTransactionEntries = getLastTransactionDate(transactions, 'positive')
        const lastTransactionExpansives = getLastTransactionDate(transactions, 'negative')
        const totalInterval = `01 a  ${lastTransactionExpansives}`

        const amount = entriesTotal - expensiveTotal;

        setHighlightData({
            entries: {
                total: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionEntries,
            },
            expansives: {
                total: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionExpansives,
            },
            total: {
                total: amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totalInterval,
            },
        })

        setIsLoading(false)
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    // Para atualizar a lista de transactions 
    useFocusEffect(useCallback(() => {
        loadTransactions()
    }, [])) 

    return(
    <Container>
    {
        isLoading ? 
           <LoadContainer>
               <ActivityIndicator color={theme.colors.primary} size={"large"}/>
           </LoadContainer>  :
            <>    
                <Header>
                    <UserWrapper>
                        <UserInfo>
                            <Photo source={{ uri: user.photo }}/>
                            <User>
                                <UserGreeting>Olá, </UserGreeting>
                                <UserName>{user.name}</UserName>
                            </User>
                        </UserInfo>

                        <LogoutButton onPress={signOut}>
                            <Icon name='power' />
                        </LogoutButton>

                    </UserWrapper>
                </Header>
                <HighlightCards >
                    <HighlightCard 
                        type="up"
                        title="Entradas" 
                        amount={highlightData.entries.total}
                        lastTransaction= {`Última entrada dia ${highlightData.entries.lastTransaction}`}/>
                    <HighlightCard
                        type="down"
                        title="Saídas" 
                        amount={highlightData.expansives.total}
                        lastTransaction= {`Última saída dia ${highlightData.expansives.lastTransaction}`}/>
                    <HighlightCard
                        type="total"
                        title="Total" 
                        amount={highlightData.total.total}
                        lastTransaction={highlightData.total.lastTransaction}/>
                </HighlightCards>
                <Transactions>
                    <Title>Listagem</Title>

                    <TransactionList
                        data={transactions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TransactionCard data={item} />}/>

                </Transactions>
            </>
    }
    </Container>

    )
}