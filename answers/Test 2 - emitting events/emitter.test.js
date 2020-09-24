const EventEmitter = require('./emitter.js')

describe('listening and unlistening', () => {
  test.only('.on() - should register a event listener', () => {
    const emitter = EventEmitter.create()
    const callback = jest.fn()

    expect(emitter.events).toEqual({})

    emitter.on('fooBar', callback)

    expect(emitter.events.fooBar).toBeInstanceOf(Array)
    expect(emitter.events.fooBar).toContain(callback)
  })

  test('.on() - should register more than one event listener', () => {
    const emitter = EventEmitter.create()
    const [callback1, callback2] = [jest.fn(), jest.fn()]

    emitter.on('customEvent', callback1)
    emitter.on('customEvent', callback2)

    expect(emitter.events.customEvent).toContain(callback1)
    expect(emitter.events.customEvent).toContain(callback2)
  })

  test('.on() - should NOT register the same listener more than once', () => {
    const emitter = EventEmitter.create()
    const [callback1, callback2] = [jest.fn(), jest.fn()]

    emitter.on('success', callback1)
    emitter.on('success', callback1)
    emitter.on('success', callback2)

    expect(emitter.events.success).toHaveLength(2)
    expect(emitter.events.success).toContain(callback1)
    expect(emitter.events.success).toContain(callback2)
  })

  test('.on() - should throw an error if no callback is passed', () => {
    const emitter = EventEmitter.create()

    expect(() => {
      emitter.on('keyup')
    }).toThrow()
  })

  test('.off() - should unregister a specific event listener', () => {
    const emitter = EventEmitter.create()
    const [callback1, callback2] = [jest.fn(), jest.fn()]

    emitter.on('click', callback1)
    emitter.on('click', callback2)

    emitter.off('click', callback1)

    expect(emitter.events.click).toContain(callback2)
    expect(emitter.events.click).not.toContain(callback1)
  })

  test(".off() - should not throw if event doesn't exist", () => {
    const emitter = EventEmitter.create()

    expect(() => emitter.off('some-event')).not.toThrow()
  })

  test('.on() - should return a method which unregisters the passed listener', () => {
    const emitter = EventEmitter.create()
    const [callback1, callback2] = [jest.fn(), jest.fn()]

    const cancel = emitter.on('load', callback1)
    emitter.on('load', callback2)

    cancel()

    expect(emitter.events.load).not.toContain(callback1)
  })
})

describe('emitting events', () => {
  test('.emit() - should emit an event and execute all listeners callbacks', () => {
    const emitter = EventEmitter.create()
    const [callback1, callback2] = [jest.fn(), jest.fn()]

    emitter.on('resize', callback1)
    emitter.on('resize', callback2)

    emitter.emit('resize')

    expect(callback1).toBeCalledTimes(1)
    expect(callback2).toBeCalledTimes(1)
  })

  test('.emit() - should pass event data, as the second argument, to all callbacks', () => {
    const emitter = EventEmitter.create()
    const callback = jest.fn()

    emitter.on('message_received', callback)
    emitter.emit('message_received', { message: 'hello' })

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'hello' })
    )
  })

  test('.emit() - should pass event `type` to all callbacks', () => {
    const emitter = EventEmitter.create()
    const callback = jest.fn()

    emitter.on('loading', callback)
    emitter.emit('loading')

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'loading' })
    )
  })

  test('.emit() - should do nothing if event has no callbacks', () => {
    const emitter = EventEmitter.create()

    expect(() => emitter.emit('keyup')).not.toThrow()
  })
})

describe('special listeners', () => {
  describe('once()', () => {
    test('should listen to an event only once', () => {
      const emitter = EventEmitter.create()

      const callback = jest.fn()

      emitter.once('click', callback)
      expect(emitter.events.click).toHaveLength(1)

      emitter.emit('click')
      expect(emitter.events.click).toHaveLength(0)
    })

    test('should return a method to cancel the listener', () => {
      const emitter = EventEmitter.create()

      const callback = jest.fn()

      const cancel = emitter.once('click', callback)
      expect(emitter.events.click).toHaveLength(1)

      cancel()
      expect(emitter.events.click).toHaveLength(0)
    })

    test('listener should received the event data', () => {
      const emitter = EventEmitter.create()

      const callback = jest.fn((e) => e)

      emitter.once('click', callback)
      emitter.emit('click', { element: 'div' })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          element: 'div',
          type: 'click',
        })
      )
    })

    test('should guarantee every callback is executed and only .once() are removed', () => {
      const emitter = EventEmitter.create()

      const callback1 = jest.fn()
      const callback2 = jest.fn()
      const callback3 = jest.fn()
      const callback4 = jest.fn()

      emitter.on('click', callback1)
      emitter.once('click', callback2)
      emitter.on('click', callback3)
      emitter.once('click', callback4)
      emitter.emit('click')

      expect(emitter.events.click).toHaveLength(2)

      expect(callback1).toBeCalledTimes(1)
      expect(callback2).toBeCalledTimes(1)
      expect(callback3).toBeCalledTimes(1)
      expect(callback4).toBeCalledTimes(1)

      expect(emitter.events.click).toContain(callback1)
      expect(emitter.events.click).toContain(callback3)
      expect(emitter.events.click).not.toContain(callback2)
      expect(emitter.events.click).not.toContain(callback4)
    })
  })

  describe('race()', () => {
    test('should accept an array of [event, callback], execute listeners of first emitted event and unlisten all of them', () => {
      const emitter = EventEmitter.create()

      const [callback1, callback2] = [jest.fn(), jest.fn(), jest.fn()]

      emitter.race([
        ['success', callback1],
        ['failure', callback2],
      ])
      expect(emitter.events.success).toHaveLength(1)
      expect(emitter.events.failure).toHaveLength(1)
      expect(emitter.events.failure).toHaveLength(1)

      emitter.emit('failure')
      emitter.emit('failure')

      expect(callback1).toBeCalledTimes(0)
      expect(callback2).toBeCalledTimes(1)

      expect(emitter.events.success).toHaveLength(0)
      expect(emitter.events.failure).toHaveLength(0)
      expect(emitter.events.failure).toHaveLength(0)
    })

    test('should return a method which cancels all listeners', () => {
      const emitter = EventEmitter.create()

      const [callback1, callback2] = [jest.fn(), jest.fn()]

      const cancel = emitter.race([
        ['success', callback1],
        ['failure', callback2],
      ])
      expect(emitter.events.success).toHaveLength(1)
      expect(emitter.events.failure).toHaveLength(1)

      cancel()
      expect(emitter.events.success).toHaveLength(0)
      expect(emitter.events.failure).toHaveLength(0)
    })

    test('listener should received the event data', () => {
      const emitter = EventEmitter.create()

      const callback = jest.fn()

      emitter.race([['click', callback]], { element: 'div' })
      emitter.emit('click', { element: 'div' })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          element: 'div',
          type: 'click',
        })
      )
    })

    test('should guarantee every callback is executed and only .race() callbacks are removed', () => {
      const emitter = EventEmitter.create()

      const [callback1, callback2, callback3, callback4, callback5] = [
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
      ]

      emitter.race([
        ['success', callback1],
        ['failure', callback2],
      ])
      emitter.race([
        ['success', callback3],
        ['failure', callback4],
      ])
      emitter.on('success', callback5)
      emitter.emit('success')

      expect(callback1).toBeCalledTimes(1)
      expect(callback2).toBeCalledTimes(0)

      expect(callback3).toBeCalledTimes(1)
      expect(callback4).toBeCalledTimes(0)

      expect(callback5).toBeCalledTimes(1)
      expect(emitter.events.success).toHaveLength(1)
      expect(emitter.events.success).toContain(callback5)
    })
  })
})
