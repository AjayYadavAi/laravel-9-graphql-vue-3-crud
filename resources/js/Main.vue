<template>
    <div class="container">
        <div class="row card p-3 mt-3">
            <div class="col-sm-12">
                <h2 class="text-muted">Graphql CRUD</h2>
                <div v-if="error">
                    <span v-for="(err,i) of error.graphQLErrors" :key="i">
                        <ul v-if="err.extensions.validation">
                            <li v-for="message of err.extensions.validation" key="message" class="text-danger">
                                {{ message[0] }}
                            </li>
                        </ul>
                    </span>
                </div>

                <form class="form" @submit.prevent="saveForm">
                    <div class="row">
                        <div class="col-sm-3">
                            <input type="text" class="form-control" placeholder="Name .." v-model="form.name">
                        </div>
                        <div class="col-sm-4" v-if="!user_id">
                            <input type="email" class="form-control" placeholder="Email .." v-model="form.email">
                        </div>
                        <div class="col-sm-3">
                            <input type="password" class="form-control" placeholder="password .." v-model="form.password">
                        </div>
                        <div class="col-sm-2">
                            <button type="submit" v-if="user_id" class="btn btn-dark">Update</button>
                            <button type="submit" v-else class="btn btn-dark">Save</button>
                        </div>


                    </div>
                </form>
                <div class="text-center" v-if="createLoading">loading.....</div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-sm-12">
                <div v-if="loading" class="text-center">Loading...</div>
                <table v-else-if="result && result.userlist.data" class="table table-bordered">
                    <thead>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                        <tr v-for="user of result.userlist.data" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.name }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <button type="button" class="btn btn-sm btn-info" @click="editUser(user.id)">Edit</button>
                                <button type="button" class="btn btn-sm btn-danger ml-2" @click="deleteUser(user.id)">Delete</button>

                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script>
    import { useQuery,useMutation  } from '@vue/apollo-composable'
    import {
        USERS_QUERY,
        CREATE_USER,
        UPDATE_USER,
        REMOVE_USER
    } from './graphql/user'

    import { reactive,ref } from 'vue'

    import gql from 'graphql-tag'

    export default{
        setup(){
            const user_id = ref(null)
            const delete_user_id = ref(null)
            const form = reactive({
                name: '',
                email: '',
                password: ''
            });

            const { result,loading,refetch  } = useQuery(USERS_QUERY)

            const { mutate: createUser,error,loading:createLoading } = useMutation(CREATE_USER, () => ({
                update: (cache, { data: { createUser } }) => {
                    let data = cache.readQuery({ query: USERS_QUERY })
                    data = {
                      ...data,
                      userlist: { data:[
                            ...data.userlist.data,
                            createUser,
                            ],
                            __typename:data.userlist.__typename
                        }
                    }
                    cache.writeQuery({ query: USERS_QUERY, data })
                },
            }))

            const { mutate: updateUser } = useMutation(UPDATE_USER, () => ({
                update: (cache, { data: { updateUser } }) => {
                    let data = cache.readQuery({ query: USERS_QUERY })
                    let updated_data = data.userlist.data.map(user =>{
                        if(user.id == updateUser.id){
                            return updateUser
                        }
                        return user;
                    })
                    data = {
                        userlist: { data:updated_data,__typename:data.userlist.__typename}
                    }

                    cache.writeQuery({ query: USERS_QUERY, data })
                },
            }))

            const { mutate: removeUser } = useMutation(REMOVE_USER, () => ({
                update: (cache, { data: { removeUser } }) => {
                    let data = cache.readQuery({ query: USERS_QUERY })

                    const delete_user = data.userlist.data.find(user=> user.id == delete_user_id.value)

                    cache.evict({ id: cache.identify(delete_user)})
                },
            }))


            const saveForm = () =>{
                let data = {
                    name : form.name,
                    email : form.email,
                    password : form.password
                }
                if(user_id.value > 0){
                    data.id = user_id.value
                    updateUser(data)
                }else{
                    createUser(data)
                }

                resetForm()
            }
            const editUser = (id)=>{
                const data = result.value.userlist.data.find(user=>user.id == id);
                form.name = data.name
                form.email = data.email
                form.password = 'password'
                user_id.value = id
            }

            const deleteUser = (id)=>{
                delete_user_id.value = id
                removeUser({id: id})
            }

            const resetForm = () =>{
                form.name = ''
                form.email = ''
                form.password = ''
                user_id.value = ''
            }

            return{
                result,
                loading,
                form,
                saveForm,
                editUser,
                user_id,
                deleteUser,
                error,
                createLoading
            }
        }
    }
</script>
