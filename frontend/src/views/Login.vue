<template>
    <v-container class="login-container">
        <v-row justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card>
                    <v-card-title>Login</v-card-title>
                    <v-card-text>
                        <v-form ref="form">
                            <v-text-field v-model="username" :rules="usernameRules" label="Username"
                                required></v-text-field>

                            <v-text-field :rules="passwordRules" v-model="password" label="Password" type="password"
                                required></v-text-field>

                            <div class="center">
                                <v-btn color="primary" class="mr-4" @click="login" :loading="loading">Login</v-btn>
                                <v-btn :loading="loading" @click="register">Register</v-btn>
                            </div>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';
import { updateLogin } from '../App.vue';

export default {
    data() {
        return {
            username: '',
            password: '',
            errorLogin: false,
            errorRegister: false,
            loading: false,
            usernameRules: [
                value => {
                    if (!value || value.length < 3) {
                        return 'Username should be at least 3 characters long';
                    }
                    if (this.errorLogin) {
                        return "Wrong username or password!"
                    }
                    if (this.errorRegister) {
                        return "Username already in use!"
                    }
                    return true;
                }
            ],
            passwordRules: [
                value => {
                    if (!value || value.length < 4) {
                        return 'At least 4 characters, come on'
                    }
                    if (this.errorLogin) {
                        return "Wrong username or password!"
                    }
                    return true;
                }
            ]
        }
    },
    methods: {
        async checkValidation() {
            this.$refs.form.resetValidation()
            this.errorLogin = false;
            this.errorRegister = false;
            await this.$refs.form.validate()
        },
        async login() {
            await this.checkValidation();

            this.loading = true;

            const { valid } = await this.$refs.form.validate()

            if (!valid) {
                this.loading = false;
                return;
            }

            await axios.post('/api/login', {
                username: this.username,
                password: this.password
            }).then(response => {
                if (response.status !== 200) {
                    this.errorLogin = true;
                    this.$refs.form.validate();
                    return;
                }
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("username", this.username)
                updateLogin(this.username, response.data.token);
                this.$router.push('/');
                this.loading = false;
            }).catch(error => {
                this.errorLogin = true;
                this.loading = false;
                this.$refs.form.validate();
            })
        },
        async register() {
            await this.checkValidation();

            this.loading = true;

            const { valid } = await this.$refs.form.validate()

            if (!valid) {
                this.loading = false;
                return;
            }

            await axios.post('/api/register', {
                username: this.username,
                password: this.password
            }).then(response => {
                if (response.status !== 200) {
                    this.errorRegister = true;
                    this.$refs.form.validate();
                    return;
                }
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("username", this.username)
                updateLogin(this.username, response.data.token);
                this.$router.push('/');
                this.loading = false;
            }).catch(error => {
                this.errorRegister = true;
                this.loading = false;
                this.$refs.form.validate();
            })
        }
    }
};
</script>

<style scoped>
.login-container {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -ms-flex-align: center;
    -webkit-align-items: center;
    -webkit-box-align: center;
    align-items: center;
    height: 100%;
}

.center {
    display: flex;
    justify-content: center;
}
</style>