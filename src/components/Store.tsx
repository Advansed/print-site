import { combineReducers  } from 'redux'
import axios from 'axios'
import { Reducer } from 'react';
import  socketIOClient from "socket.io-client"
import { Geolocation, StoragePluginWeb } from '@capacitor/core';

export var datas = {
    service: {
        id: 0,
        name: "",
        image: "",
        franchaise: "",    
        state: "",
        city:   "",
        locality: "",
        street: "",
        home: "",
        office: "",
    },

}

var reducers: Array<Reducer<any, any>>;reducers = []

export const socket = socketIOClient( "http://89.208.211.109/" )

export const i_state = {
    auth:       false,
    login:      {
        phone:      "",
        fio:        "",
        email:      "",
        pass:       "",
    },
    services:   [],
    s_coord:    {
        coords: {
          latitude:   62.0275204,
          longitude:  129.7125726,
        }
    },
    markers:    [],
    users:      [],

}

export async function getData(method : string, params){

    let res = await axios.post(
        URL + method,
        params,
        // {
        //     auth: {
        //         username: unescape(encodeURIComponent(user)),
        //         password: unescape(encodeURIComponent(password))
        //     }
        // } 
        ).then(response => response.data)
        .then((data) => {
            if(data.Код === 200) console.log(data) 
            return data
        }).catch(error => {
          console.log(error)
          return {Код: 200}
        })
    return res

}

for(const [key, value] of Object.entries(i_state)){
    reducers.push(
        function (state = i_state[key], action) {
            switch(action.type){
                case key: {
                    if(typeof(value) === "object"){
                        if(Array.isArray(value)) {
                            return action[key]
                        } else {
                            let data: object; data = {};
                            for(const key1 of Object.keys(value)){ 
                                data[key1] = action[key1] === undefined ? state[key1] : action[key1]
                            }   
                            return data
                        }

                    } else return action[key]
                }
                default: return state;
            }       
        }

    )
}

const       rootReducer = combineReducers({

    auth:       reducers[0],
    login:      reducers[1],
    services:   reducers[2],
    s_coord:    reducers[3],
    markers:    reducers[4],
    users:      reducers[5],

})

interface t_list {
    num: number, type: string, func: Function,
}

function    create_Store(reducer, initialState) {
    var currentReducer = reducer;
    var currentState = initialState;
    var listeners: Array<t_list>; listeners = []
    return {
        getState() {
            return currentState;
        },
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            listeners.forEach((elem)=>{
                if(elem.type === action.type){
                    elem.func();
                }
            })
            return action;
        },
        subscribe(listen: t_list) {
            var ind = listeners.findIndex(function(b) { 
                return b.num === listen.num; 
            });
            if(ind >= 0){
                listeners[ind] = listen;
            }else{
                listeners = [...listeners, listen]
            }
 
        }
    };
}

async function getLocation() {
    try {
        const posit = await Geolocation.getCurrentPosition();
        Store.dispatch({type: "s_coord", s_coord: posit});
    } catch (e) {
        console.log("error getLocation")
       // setLoading(false);
    }
  }

function getAll(info) {
    let jarr: any; jarr = []
    info.forEach(elem => {
        jarr = [...jarr, elem.id]
    });

    return jarr
}

async function exec(){

    /////////////////////////franchaisers////////////////////////////////////////////////////
    socket.once("method_franchaisers", (data) =>{

        Store.dispatch({type: "users", users: data[0][0].json})

        let jarr = getAll(data[0][0].json);
        socket.emit("method", { method: "service_tree", param: "", franch: jarr })

    })
    socket.emit("method", { method: "franchaisers" })
    /////////////////////////////////////////////////////////////////////////////////////////

    /////////////////////////service_tree////////////////////////////////////////////////////
    socket.once("method_service_tree", (data)=>{

        Store.dispatch({type: "services", services: data[0][0].json === null ? [] : data[0][0].json})
    })
    ////////////////////////////////////////////////////////////////////////////////////////

    getLocation();

}

export const Store = create_Store(rootReducer, i_state)
export const URL = "http://89.208.211.109/"

export async function getDatas(){
}

exec();

