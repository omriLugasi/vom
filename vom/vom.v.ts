import {elementType} from './enums.v'

const inherent = 'vom';
let bandedViews:Array<any> = [];

function pushView(propertyKey: string | symbol ,  viewName:any, type:elementType){
    bandedViews.push({
        prop : propertyKey,
        viewName : viewName,
        type : type
    })
}

export function bindView(viewName:string , type:elementType){
    function actualDecorator(target: Object, propertyKey: string | symbol): void {
        pushView(propertyKey ,viewName , type);
    }
    return actualDecorator;
}

export function vomBindMyViews(target:any){
        bandedViews.map(function(view){
            if(view.type === elementType.class)
                target[view.prop] =document.getElementsByClassName(view.viewName);
            else if (view.type === elementType.id)
                target[view.prop] = document.getElementById(view.viewName);
            else
                target[view.prop] = document.getElementsByTagName(view.viewName);
        })
}

export function getterSetter(target?: any, propertyKey?: string | symbol, parameterIndex?: number) {
    function capitalizeFirstLetter(string) {return string.charAt(0).toUpperCase() + string.slice(1);}
    propertyKey = capitalizeFirstLetter(propertyKey.toString());
    let keyGet = 'get' + propertyKey.toString();
    let keySet = 'set' + propertyKey.toString();

    if(!target[inherent])
        target[inherent] = {};

    target[inherent][keyGet] = (): any  => {
        return target[propertyKey];
    }

    target[inherent][keySet] = (value:any): any => {
        target[propertyKey] = value;
    }
}

export function immutable(value:any) {
    function actualDecorator(target: Object, propertyKey: string | symbol): void {
        Object.defineProperty(target, propertyKey.toString(), {
            writable: false,
            value: value
        });
    }

    // return the decorator
    return actualDecorator;
}

export function assignClass(className:any) {
    function actualDecorator(target: Object, propertyKey: string | symbol): void {
        target[propertyKey] = new className();
    }

    // return the decorator
    return actualDecorator;
}

export function assignSingleton(className:any) {
    function actualDecorator(target: Object, propertyKey: string | symbol): void {
        target[propertyKey] = className.getInstance();
    }

    // return the decorator
    return actualDecorator;
}

export function observeOn(target?: any, propertyKey?: string | symbol, parameterIndex?: number){
    let observer = VomObserver.getInstance();

    const handler = {
        set(target, key, value) {
            observer.notify(propertyKey , key , value);
            return true;
        },
    };
    target[propertyKey] = new Proxy({}, handler);
    target[propertyKey].$$$hash = undefined;
}

export class VomObserver{

    private subscribers = [];
    private static  instance:any;


  static  getInstance():any{
        if(this.instance)
            return this.instance;
        else{
            this.instance = new VomObserver();
            return this.instance;
        }
    }

    subscribe(propertyName:string , Fn:any ): void{
        this.subscribers.push({
            Fn: Fn,
            name: propertyName
        })
    }

    notify(propertyName:string ,key, value:any):void{
        this.subscribers.map((item)=>{
            if(item.name === propertyName){
                let returnValue = {};
                returnValue[key] = value;
                item.Fn.call({},returnValue);
            }
        })
    }

    unSubscribe(Fn:any):void{
        let index = -1;
        this.subscribers.map((item , i)=> {
            if(item.Fn === Fn){
                index = i;
            }
        })
        if(index !== -1)
            this.subscribers.splice(index , 1);
    }


}

declare function Proxy(object:any , handler:any):void;
