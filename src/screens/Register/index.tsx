import React, { useState } from "react";
import { Alert, Keyboard, Modal, TouchableWithoutFeedback } from "react-native";
import { useForm } from "react-hook-form";
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native'

import { InputForm } from "../../components/Form/InputForm";
import { Button } from "../../components/Form/Button";
import { TransactionTypeButton } from "../../components/Form/TransactionTypeButton";
import { CategorySelectedButton } from "../../components/Form/CategorySelectButton";
import { CategorySelect } from '../CategorySelect'

import { 
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes,
 } from './styles'
import { useAuth } from "../../hooks/auth";

 type NavigationProps = {
     navigate: (Screen: string) => void
 }

interface FormData {
    name: string;
    amount: string;
}

const schema = Yup.object().shape({
    name: Yup.string()
    .required('Nome é obigatório'),
    amount: Yup.number()
    .typeError('Informe um valor numérico')
    .positive('O valor não pode ser negativo')
    .required('O valor é obrigatório')
})

export function Register() {

    // States
    
    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria',
    });

    const {user} = useAuth();

    const navigation = useNavigation<NavigationProps>();

    const { 
        control, 
        reset,
        handleSubmit,
        formState: {errors} 
    } = useForm({
        resolver: yupResolver(schema)
    })

    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    // Handler Methods
    
    function handleTransactionTypeSelect(type: 'positive' | 'negative') {
        setTransactionType(type);
    }

    function handleOpenSelectCategoryModal() {
        setCategoryModalOpen(true)
    }

    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false)
    }

    async function handlerRegister(form : FormData) {
        if(!transactionType) {
            return Alert.alert('Selecione o tipo da transação.')
        }

        if(category.key === 'category') {
            return Alert.alert('Selecione a categoria.')
        }

        // Dados persistidos no form-async

        const newTransaction = {
            id: String(uuid.v4()) ,
            name: form.name,
            amount: form.amount,
            type: transactionType,
            category: category.key,
            date: new Date()
          }
        try {
            const dataKey = `@gofinances:transactions_user:${user.id}`;
            const data = await AsyncStorage.getItem(dataKey);
            const currentData = data ? JSON.parse(data) : [];

            const dataFormatted = [
                ...currentData,
                newTransaction
            ];

            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

            // Reset do form

            reset();
            setTransactionType('');
            setCategory({
                key: 'category',
                name: 'Categoria'
            });

            // Redireciona para a listagem após savar

            navigation.navigate('Listagem')

        } catch (error) {
            console.log(error);
            Alert.alert('Não foi possível salvar.')
        }
    }
    
    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>

            <Form>
                <Fields>
                    <InputForm
                        name="name"
                        control={control}
                        placeholder="Nome"
                        autoCapitalize="sentences"
                        autoCorrect={false}
                        error={errors.name && errors.name.message}/>
                    <InputForm
                        name="amount"
                        control={control}
                        placeholder="Preço"
                        keyboardType="numeric"
                        error={errors.amount && errors.amount.message}/>
                <TransactionsTypes>
                    <TransactionTypeButton
                        type="up"
                        title="Income"
                        onPress={() => handleTransactionTypeSelect('positive')}
                        isActive={transactionType === 'positive'}/>

                    <TransactionTypeButton
                        type="down"
                        title="Outcome"
                        onPress={() => handleTransactionTypeSelect('negative')}
                        isActive={transactionType === 'negative'}
                        />
                </TransactionsTypes>
                <CategorySelectedButton 
                    title={category.name}
                    onPress={handleOpenSelectCategoryModal} />
                </Fields>
            <Button 
                title="Enviar"
                onPress={handleSubmit(handlerRegister)} />
            </Form>


            <Modal visible={categoryModalOpen} >
                <CategorySelect
                    category={category}
                    setCategory={setCategory}
                    closeSelectCategory={handleCloseSelectCategoryModal} />
            </Modal>

            </Container>
        </TouchableWithoutFeedback>
    )
}