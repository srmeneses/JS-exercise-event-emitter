# Event Emitter

The goal of this exercise is to create an event emitter which can listen, unlisten and emit events.

The main module exports an object with a `create` method which act as a factory and should return a new event emitter every time it is called. The implementation of the emitter itself is up to you.

<!-- @import "[TOC]" {cmd="toc" depthFrom=2 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Running tests](#running-tests)
- [Example](#example)
- [Documentation](#documentation)
  - [Creating a new Emitter](#creating-a-new-emitter)
  - [Methods](#methods)
    - [on](#on)
    - [off](#off)
    - [emit](#emit)
    - [once](#once)
    - [race](#race)

<!-- /code_chunk_output -->

## Running tests

By executing the _package.json_ `test` script, a `jest` process will start and re-run the test suite after every file change you made.

---

## Example

```js
import Emitter from './emitter.js'

const emitter = Emitter.create()

const handleMyEvent = () => {
  console.log('Hello!')
}

// Registers the callback `handleMyEvent` to be called when we call emitter.emit passing `myEvent` as parameter
emitter.on('myEvent', handleMyEvent)

// This will call the `handleMyEvent` function
emitter.emit('myEvent')

// Will print "Hello!"

// Unregisters the callback `handleMyEvent`
emitter.off('myEvent', handleMyEvent)

// No function will be called since `myEvent` does not have any callbacks assigned to it anymore
emitter.emit('myEvent')

```

## Documentation

### Creating a new Emitter

```js
const EventEmitter = require('...')

// Return a new event emitter
const emitter = EventEmitter.create()
```

### Methods

#### on

> `on(event: string, callback: function): function`

Registers a `callback` that runs when `event` is emitted.

**Example**:

```js
emitter.on('click', () => {
  console.log('Click!')
})
// register a new listener for the 'click' event
```

It returns a method which unregisters the listener:

**Example**:

```js
const cancel = emitter.on('click', () => {
  console.log('Click!')
})

cancel()
// unregister the click listener
```

---

#### off

> `off(event: string, callback: function)`

Unregisters a `callback` from the `event` callback list.

**Example**:

```js
const callback = () => {
  console.log('Click!')
}

// register the listener
emitter.on('click', callback)

// unregister the listener
emitter.off('click', callback)
```

---

#### emit

> `emit(event: string, data: object)`

Execute all callbacks registered for `event` passing `data` as a parameter.

**Example**:

```js
emitter.on('click', () => console.log('Click 1'))
emitter.on('click', () => console.log('Click 2'))
emitter.on('click', () => console.log('Click 3'))

emitter.emit('click')
// Prints:
// Click 1
// Click 2
// Click 3
```

Every listener callback receives a `data` object which contains the `type` of the event and any other property passed on `.emit()`:

**Example**:

```js
emitter.on('loaded', e => console.log(e))

emitter.emit('loaded', { foo: 'potato' })
// Prints:
// { type: 'loaded', foo: 'potato' }
```

---

#### once

> `once(event: string, callback: function): function`

Registers a `callback` tha runs only once when `event` is emitted.

**Example**:

```js
emitter.once('click', () => console.log('Single click!'))

emitter.emit('click')
emitter.emit('click')

// Prints 'Single click!' only once
```

---

#### race

> `race(Array<[event: string, callback: function]>): function`

Receives a list of `[event, callback]` and when any of the passed events is emitted, it unregisters all of them.

**Example**:

```js
emitter.race([
  ['success', () => console.log('Success!')],
  ['failure', () => console.log('Failure :(')],
])

emitter.emit('success') // Prints 'Success!', `success` and `failure` are unregistered.
emitter.emit('failure') // nothing happens
```
