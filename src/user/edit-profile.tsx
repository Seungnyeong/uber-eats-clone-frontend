import { gql, useApolloClient, useMutation } from "@apollo/client";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Button } from "../components/button";
import { useMe } from "../hooks/useMe";
import { EditProfileMutation, EditProfileMutationVariables } from "../__api__/types";

const EDIT_PROFILE_MUTATION = gql`
    mutation editProfile($input: EditProfileInput!) {
        editProfile(input:$input) {
            ok
            error
        }
    }
`

interface IFormProps {
    email? : string;
    password?: string;
}

export const EditProfile = () => {
    const { data : userData } = useMe();
    const client = useApolloClient();
    const onCompleted = (data: EditProfileMutation) => {
        const {
            editProfile: {ok}
        } = data;
        if (ok && userData) {
            const { me : { email : prevEmail, id }} = userData;
            const { email: newEmail } = getValues();
            if(prevEmail !== newEmail) {
                client.writeFragment({
                    id : `User:${id}`,
                    fragment: gql`
                        fragment EditedUser on User {
                            verified
                            email
                        }
                    `,
                    data : {
                        email: newEmail,
                        verified : false,
                    }
                });
            }

        }
    }
    const [editProfile, { loading }] = useMutation<EditProfileMutation, EditProfileMutationVariables>(EDIT_PROFILE_MUTATION, {
        onCompleted
    });
    const { register, handleSubmit, getValues, formState} = useForm<IFormProps>({
        mode: "onChange",
        defaultValues : {
            email: userData?.me.email,
        }
    });

    const onSubmit = () => {
        const {email, password} = getValues();
        editProfile({
            variables: {
                input: {
                    email,
                    ...(password !== "" && { password })
                }
            }
        })
    }

    return <div className="mt-52 flex flex-col justify-center items-center">
        <Helmet>
            <title>Edit Profile | Nuber Eats</title>
        </Helmet>
    <h4 className="font-semibold text-2xl mb-3">Edit Profile</h4>
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5">
      <input className="input" type="email" placeholder="Email" {...register("email", {
        pattern : /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      })} />
      <input className="input" type="password" placeholder="Password"  {...register("password", {

      })}/>
      <Button loading={loading} canClick={formState.isValid} actionText="Save Profile" />
    </form>
  </div>
};