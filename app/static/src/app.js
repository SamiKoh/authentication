const url = 'http://127.0.0.1:3000/api/item';
 
const app = new Vue({
    el: '#app',
    data () {
        return {
            items: [ {name: "Tomaatti"}, {name: "Kurkku"} ],
            loading: true,
            text: ''
        }
    },
    created () {
        this.$on('click', (event) => {
            console.log('click event', event);
            this.get()
        })
    },
    mounted () {
        this.get();
    },
    methods: {
        add: function() {
            this.loading = true;
            axios
                .post(url, {name: this.text})
                .then((res) => {
                    this.items = res.data;
                    console.log(res);
                })
                .catch(e => console.log(e))
                .finally(() => {
                    this.text = "";
                    this.loading = false;
                });
        },
        get : function () {
            this.loading = true;
            
                axios
                    .get(url)
                    .then(res => {console.log(res); this.items = res.data})
                    .catch(e => console.log(e))
                    .finally(() => {})

            setTimeout( function () {
                // Demonstrate that loading element exists
                app.loading = false;
            }, 2000);
        }
    }
});

const remove = (event) => {
    let id = event.target.parentElement.childNodes[1].innerText;
    if (!!id) {
        app.loading = true;
        axios.delete(url, {data: {_id: id}})
        .then((res) => {
            app.items = res.data;
        })
        .catch(e => console.log(e))
        .finally(app.loading = false);
    }
}