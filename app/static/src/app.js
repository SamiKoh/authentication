const url = 'http://127.0.0.1:3000/api/';

const app = new Vue({
    el: '#app',
    data () {
        return {
            items: [ ],
            loading: true,
            text: '',
            login: true,
            register: false,
            user: {email:"", pwd:""}
        }
    },
    created () {

        /* if (localStorage) */

/*         this.$on('click', (event) => {
            console.log('click event', event);
            this.get()
        }) */
    },
    mounted () {
        //this.get();
    },
    methods: {
        add: function() {
            this.loading = true;
            axios
                .post(url + 'item', {name: this.text}, {headers: {"Authorization" : localStorage.getItem("auth")}})
                .then((res) => {
                    this.items = res.data;
                    console.log("add response", res);
                })
                .catch(e => {this.login = true; console.log(e)})
                .finally(() => {
                    this.text = "";
                    this.loading = false;
                });
        },
        get : function () {
            this.loading = true;
            
                axios
                    .get(url + 'item', {headers: {"Authorization" : localStorage.getItem("auth")}})
                    .then(res => {console.log("get response",res); this.items = res.data; this.loading = false;})
                    .catch(e => {this.login = true; console.log(e)})
                    .finally(() => {})
/* 
            setTimeout( function () {
                // Demonstrate that loading element exists
                app.loading = false;
            }, 2000); */
        },
        sendRegistration: function (){
            axios.post(url + 'register', {user:{email: this.user.email, password: this.user.pwd}})
            .then(res => {
                this.register = false;
                console.log(res)
            })
            .catch(e => console.log())
        },
        sendLogin: function (){
            axios
                .post(url + 'login', {user:{email: this.user.email, password: this.user.pwd}})
                .then(res => {
                    console.log("login response: ",res);
                    this.login = false;
                    localStorage.setItem('auth', "Token " + res.data.user.token);
                    this.get()
                })
                .catch(e => console.log(e))
            
        },
        logout: function () {
            this.login = true;
            localStorage.removeItem('auth');
        }
    }
});

const remove = (event) => {
    let id = event.target.parentElement.childNodes[1].innerText;
    if (!!id) {
        app.loading = true;
        axios.delete(url + 'item', {data: {_id: id}, headers: {"Authorization" : localStorage.getItem("auth")}})
        .then((res) => {
            app.items = res.data;
        })
        .catch(e =>{app.login = true; console.log(e)})
        .finally(app.loading = false);
    }
}