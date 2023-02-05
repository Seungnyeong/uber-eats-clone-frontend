import { ApolloError, gql, useMutation } from "@apollo/client";
import React from "react";
import { useForm } from "react-hook-form";
import { FormError } from "../components/form-error";
import { LoginMutation, LoginMutationVariables } from "../__api__/types";

const LOGIN_MUTATION = gql`
    mutation login($loginInput: LoginInput!) {
        login(input : $loginInput) {
            ok
            token
            error
        }
    }
`

interface ILoginForm {
    email : string;
    password : string;
}

export const Login = () => {

    const { register, getValues, formState : { errors }, handleSubmit} = useForm<ILoginForm>()
    const onCompleted = (data : LoginMutation) => {
        const { login : { ok, token}} = data;
        if(ok) {
            console.log(token)
        }
    }
    const [loginMutation, { data: loginMutationResult, loading }] = useMutation<LoginMutation, LoginMutationVariables>(LOGIN_MUTATION, {
        onCompleted
    });
    const onSubmit = () => {
        if (!loading) {
            const {email, password} = getValues();
            loginMutation({
                variables : {
                    loginInput : {
                        email, 
                        password
                    }
                }
            })
        }
    }

    return <div className="h-screen flex items-center justify-center bg-gray-800">
        <div className="bg-white w-full max-w-lg py-10 pt-10 pb-5 rounded-lg text-center">
            <h3 className="text-2xl text-gray-800">Log In</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 mt-5 px-5">
                <input {...register('email', {
                    required: "Email Required",
                    
                })} placeholder="Email" className="input mb-3"/>
                {
                    errors.email?.message && <FormError errorMessage={errors.email?.message} />
                }
                <input {...register('password', {
                    required: "Password Required",
                    minLength : 1
                })} placeholder="Password" className="input" type="password" />
                {errors.password?.message && <FormError errorMessage={errors.password?.message} />}
                {errors.password?.type === "minLength" && <FormError errorMessage="Password must be more than 10 chars" />}
                <button className="mt-3 btn">
                    {loading ? "Loading..." : "Log In"}
                </button>
                {
                    loginMutationResult?.login.error && <FormError errorMessage={loginMutationResult.login.error} />
                }
            </form>
        </div>
    </div>
}