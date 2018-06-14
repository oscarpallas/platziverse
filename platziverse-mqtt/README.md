# platziverse-mqtt

## `agent/connected`

```js
{
	agent: {
		uuid,
		username, 
		name, 
		hostname,
		pid
	}
}
```

## `agent/disconnected`

```js
{
	agent: {
		uuid
	}
}
```

## `agent/message`

```js
{
	agent,
	metrics: [
		{
			type,
			value
		}
	],
	timestamp
}
```