function create() {
    const events = {};

    let on = (name, callBack) => {
        //should throw an error if no callback is passed
        if(callBack === undefined){
            throw "No callBack passed";
        }

        if(!events[name]){
            events[name] = [callBack];
        }
        //should NOT register the same listener more than once
        else if(!events[name].includes(callBack)){
            events[name].push(callBack);
        }

        //should return a method which unregisters the passed listener
        return () => {
            if(events[name] && events[name].includes(callBack)){
                events[name].splice(events[name].indexOf(callBack), 1);
            }
        }
    }

    //should unregister a specific event listener
    let off = (name, callBack) => {
        //should not throw if event doesn't exist
        if(events[name] && events[name].includes(callBack)){
            events[name].splice(events[name].indexOf(callBack), 1);
        }
    }

    let emit = (name, data = undefined) => {
        
        //should do nothing if event has no callbacks
        if(events[name]){
            
            //should emit an event and execute all listeners callbacks
            for(callBack of events[name]){
                        
                //should pass event `type` to all callbacks
                if(data === undefined){
                    data = {"type" : name}
                }

                //should pass event data, as the second argument, to all callbacks
                callBack(data)
            }        
        }
    }

    let once = () => {

    }

    let race = function(){

    }

    
    
    return {
        on,
        off,
        emit,
        once,
        race,
        events
    };
    
}

module.exports = { create }
