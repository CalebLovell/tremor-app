import * as React from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Gyroscope, ThreeAxisMeasurement } from 'expo-sensors'
import { Subscription } from '@unimodules/react-native-adapter'

export default function App() {
	const [prevData, setPrevData] = React.useState<ThreeAxisMeasurement>({
		x: 0,
		y: 0,
		z: 0,
	})
	const [data, setData] = React.useState<ThreeAxisMeasurement>({
		x: 0,
		y: 0,
		z: 0,
	})
	const [subscription, setSubscription] = React.useState<Subscription | null>(null)
	const [tremors, setTremors] = React.useState<ThreeAxisMeasurement[]>([])

	const { x, y, z } = data

	React.useEffect(() => {
		if (prevData.x - data.x > 1 || prevData.x - data.x < -1) setTremors([...tremors, data])
		if (prevData.y - data.y > 1 || prevData.y - data.y < -1) setTremors([...tremors, data])
		if (prevData.z - data.z > 1 || prevData.z - data.z < -1) setTremors([...tremors, data])
	}, [data])

	const _slow = () => {
		Gyroscope.setUpdateInterval(1000)
	}

	const _fast = () => {
		Gyroscope.setUpdateInterval(100)
	}

	const _subscribe = () => {
		setSubscription(
			Gyroscope.addListener(newData => {
				setPrevData(data)
				setData(newData)
			}),
		)
	}

	const _unsubscribe = () => {
		subscription && subscription.remove()
		setSubscription(null)
	}

	React.useEffect(() => {
		_subscribe()
		return () => _unsubscribe()
	}, [])

	return (
		<View style={styles.container}>
			<Text style={styles.text}>Gyroscope:</Text>
			<Text style={styles.text}>
				x: {round(x)} y: {round(y)} z: {round(z)}
			</Text>
			<Text style={styles.text}>Number of Tremors: {tremors.length}</Text>
			<View style={styles.buttonContainer}>
				<TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
					<Text>{subscription ? 'On' : 'Off'}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
					<Text>Slow Detection</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={_fast} style={styles.button}>
					<Text>Frequent Detection</Text>
				</TouchableOpacity>
			</View>
			<Button title='Reset' onPress={() => setTremors([])} />
		</View>
	)
}

function round(n: number) {
	if (!n) return 0
	return Math.floor(n * 100) / 100
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 10,
	},
	text: {
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		alignItems: 'stretch',
		marginTop: 15,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#eee',
		padding: 10,
	},
	middleButton: {
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderColor: '#ccc',
	},
})
