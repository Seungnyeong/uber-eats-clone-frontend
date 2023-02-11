import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import {Helmet} from "react-helmet-async";
import { FormError } from "../components/form-error";
import { CreateAccountMutation, CreateAccountMutationVariables, UserRole } from "../__api__/types";
import nuberlogo from "../images/logo.svg"
import { Button } from "../components/button";
import { Link, useNavigate } from "react-router-dom";

const CREATE_ACCOUNT_MUTATION = gql`
    mutation createAccount($createAccountInput: CreateAccountInput!) {
        createAccount(input : $createAccountInput) {
            ok
            error
        }
    }
`

interface ICreateAccountForm {
    email: string;
    password: string;
    role : UserRole;
}

export const CreateAccount = () => {

    const { register, getValues, formState: { errors, isValid }, handleSubmit } = useForm<ICreateAccountForm>({
        mode: "onBlur",
        defaultValues : {
            role: UserRole.Client
        }
    })
    const navigate = useNavigate();
    const onCompleted = (data: CreateAccountMutation) => {
        const { createAccount: { ok } } = data;
        if (ok) {
            alert("Account Created Log in now!")
            navigate("/", {
                replace: true
            })
        }
    }
    const [createAccountMutation, {loading, data: createAccountMutationResult, error}] = useMutation<CreateAccountMutation, CreateAccountMutationVariables>(CREATE_ACCOUNT_MUTATION, {
        onCompleted
    });
    const onSubmit = () => {
        if (!loading) {
            const { email, password, role } = getValues();
            createAccountMutation({
                variables: {
                    createAccountInput: {
                        email,
                        password,
                        role
                    }
                }
            })
        }
    }

    return <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
        <div className="w-full max-w-screen-sm flex flex-col items-center px-5">
            <Helmet>
                <title>Create Account | Nuber Eats</title>
            </Helmet>
        <img src={nuberlogo} alt="logo" className="w-52 mb-5"/>
        <h4 className="w-full text-left font-medium text-3xl mb-10">Create Account</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 mt-5 w-full mb-3">
            <input {...register('email', {
                required: "Email Required",
                pattern : /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            })} placeholder="Email" className="input" />
            {
                errors.email?.message && <FormError errorMessage={errors.email?.message} />
            }
            {
                errors.email?.type === "pattern" && <FormError errorMessage={"Please enter a valid email"} />
            }
            <input {...register('password', {
                required: "Password Required",
                minLength: 1
            })} placeholder="Password" className="input" type="password" />
            {errors.password?.message && <FormError errorMessage={errors.password?.message} />}
            {errors.password?.type === "minLength" && <FormError errorMessage="Password must be more than 10 chars" />}
            <select {...register("role", {
                required : true
            })} className="input">
                {Object.keys(UserRole).map((role, index) => <option key={index}>{role}</option>)}
                </select>
           <Button 
                canClick={isValid}
                loading={loading}
                actionText={"Create Account"}
           />
            {
                createAccountMutationResult?.createAccount.error && <FormError errorMessage={createAccountMutationResult?.createAccount.error} />
            }
        </form>
        <div>
            Already have an account{" "}? <Link to="/" className="text-lime-600 hover:underline">Log in now</Link>
        </div>
        </div>
    </div>
}