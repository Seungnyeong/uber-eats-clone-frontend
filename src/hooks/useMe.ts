import { gql, useQuery } from "@apollo/client"
import { Query } from "../__api__/types";

const ME_QUERY = gql`
    query me {
        me {
            id
            email
            role
            verified
        }
    }
`

export const useMe = () => {
    return useQuery<Query>(ME_QUERY);
}