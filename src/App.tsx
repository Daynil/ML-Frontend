import { Chart } from 'chart.js/auto';
import { Component, createSignal, onMount } from 'solid-js';
import Button from './lib/components/button';
import Refresh from './lib/components/svg/refresh';
import Spinner from './lib/components/svg/spinner';
import { classNames, getFormattedDuration, round } from './lib/util';

type LearnerStats = {
	run_id: string;
	total_epochs: number;
	current_epoch: number;
	current_item: number;
	total_items: number;
	num_batches: number;
	loss_value: number;
	seconds_per_item: number;
	loop_type: 'train' | 'valid' | 'test';
	accuracy?: number;
};

type Message = string | LearnerStats;

const testMessages = [];
testMessages.push(
	'This is a really long initial message that will overflow on the x axis.'
);
for (let i = 0; i < 100; i++) {
	testMessages.push(`Test ${i}`);
}

const testRuns = [];
for (let i = 0; i < 100; i++) {
	testRuns.push({
		run_id: 'legislative-peach-leopard',
		total_epochs: 1000,
		current_epoch: 50,
		total_items: 10,
		current_item: 6,
		loss_value: 18.4234,
		accuracy: 0.809,
		seconds_per_item: 0.064564
	} as LearnerStats);
}

const [messages, setMessages] = createSignal<string[]>([]);
const [runStats, setRunStats] = createSignal<LearnerStats[]>([]);
const [runs, setRuns] = createSignal<LearnerStats[]>([]);
const [websocket, setWebsocket] = createSignal<WebSocket>(null);
const [connected, setConnected] = createSignal(false);
const [runActive, setRunActive] = createSignal(false);
const [chart, setChart] = createSignal<Chart<'line', number[], number>>(null);

function setupWebsocket(url: string) {
	const ws = new WebSocket(url);
	setWebsocket(ws);
	ws.onopen = function (event) {
		setConnected(true);
	};
	ws.onmessage = function (websocket_message) {
		// console.log(websocket_message);
		const raw_message = websocket_message.data;
		try {
			const parsed_message: Message = JSON.parse(raw_message);
			if (typeof parsed_message !== 'string') {
				if (parsed_message.loop_type === 'train') {
					console.log(parsed_message);
					setRunStats([...runStats(), parsed_message]);
					updateChart(parsed_message.current_item, parsed_message.loss_value);
				} else {
					// Validation set only called once
					setRuns([...runs(), parsed_message]);
				}
			}
		} catch (error) {
			setMessages([...messages(), raw_message]);
		}
	};
	ws.onerror = function (error) {
		setMessages([...messages(), `Websocket error: ${JSON.stringify(error)}`]);
	};
	ws.onclose = function (closed) {
		setRunActive(false);
		console.log('closed');
		setMessages([
			...messages(),
			`Websocket closed${closed.reason ? ': ' + closed.reason : ''}`
		]);
		setConnected(false);
	};
}

function runProgress() {
	console.log('called!');
	if (!runStats().length)
		return { epoch: 20, items: 60, totalItemsLeft: 20000, speed: 0.063542 };
	const latestStats = runStats()[runStats().length - 1];
	return {
		epochsCompletePercent:
			(latestStats.current_epoch / latestStats.total_epochs) * 100,
		itemsCompletePercent:
			(latestStats.current_item / latestStats.total_items) * 100,
		totalItemsLeft:
			latestStats.total_items -
			latestStats.current_item +
			(latestStats.total_epochs - latestStats.current_epoch) *
				latestStats.total_items,
		speed: latestStats.seconds_per_item,
		accuracy: latestStats.accuracy < 0 ? 0 : latestStats.accuracy
	};
}

function updateChart(label, data) {
	chart().data.labels.push(label);
	chart().data.datasets.forEach((dataset) => dataset.data.push(data));
	chart().update('none');
}

const App: Component = () => {
	let canvas: HTMLCanvasElement;

	onMount(() => {
		setupWebsocket('ws://localhost:8765/');
		const chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: runStats().map((_stat, idx) => idx),
				datasets: [
					{
						label: 'Loss',
						data: runStats().map((stat) => stat.loss_value)
					}
				]
			},
			options: {
				elements: {
					point: {
						radius: 0
					}
				}
			}
		});
		setChart(chart);
	});

	// onCleanup(() => {
	//   websocket().close(1, "Closing!");
	// });

	async function toggleRun() {
		console.log('sending');
		if (runActive()) {
			websocket().send('cancel');
			setRunActive(false);
		} else {
			websocket().send('run');
			setRunActive(true);
		}
	}

	return (
		<div class="w-full min-h-screen text-gray-900 bg-gray-100 text-lg pb-20">
			<div class="max-w-6xl mx-auto">
				<h1 class="text-4xl font-bold text-center pt-4">ML Dashboard</h1>
				<div class="mt-4">
					<div class="rounded-lg bg-white p-4 w-48 shadow-sm">
						<div class="text-sm font-medium text-gray-500">Server Status</div>
						<div class="flex text-sm items-center mt-1">
							<span
								class={classNames(
									connected() ? 'bg-green-200' : 'bg-red-200',
									'h-4 w-4 rounded-full flex items-center justify-center'
								)}
								aria-hidden="true"
							>
								<span
									class={classNames(
										connected() ? 'bg-green-400' : 'bg-red-400',
										'h-2 w-2 rounded-full'
									)}
								/>
							</span>
							<span class="ml-1">
								{connected() ? 'Connected' : 'Disconnected'}
							</span>
							{!connected() && (
								<button
									class="ml-4"
									onclick={() => setupWebsocket('ws://localhost:8765/')}
								>
									<Refresh class="h-5 w-5 transition-colors hover:animate-spin hover:text-gray-600" />
								</button>
							)}
						</div>
					</div>
					<div class="w-32 mt-6"></div>
					<div class="flex mt-6">
						<div class="w-2/3">
							<div>
								<h3 class="text-xl font-semibold text-gray-900">Current Run</h3>
								{runActive() ? (
									<div>
										<div class="mt-2 flex items-center ml-2">
											<Spinner class="h-6 w-6 text-blue-500" />
											<div class="ml-6 w-28">
												<Button
													variant="outline"
													class="text-sm px-1 py-1"
													onclick={toggleRun}
												>
													Cancel Run
												</Button>
											</div>
										</div>
										<div class="rounded-lg shadow-sm bg-white w-1/3 mt-4">
											<div class="border-b border-gray-200 px-6 py-2">
												<div class="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
													<h3 class="ml-2 mt-2 text-lg font-semibold leading-6 text-gray-900">
														Stats
													</h3>
												</div>
											</div>
											<div class="p-4">
												<div class="text-sm w-40">
													<span class="font-semibold">
														{runProgress().speed
															? round(1 / runProgress().speed, 2)
															: '-'}
													</span>{' '}
													<span class="text-gray-600">items / sec</span>
												</div>
												<div class="text-sm mt-1">
													<span class="font-semibold">
														{getFormattedDuration(
															runProgress().totalItemsLeft *
																runProgress().speed *
																1000,
															true
														)}
													</span>{' '}
													<span class="text-gray-600">remaining</span>
												</div>
												<div class="text-sm mt-1">
													<span class="font-semibold">
														{round(runProgress().accuracy * 100, 2)}
													</span>
													{'% '}
													<span class="text-gray-600">accuracy</span>
												</div>
											</div>
										</div>
									</div>
								) : (
									<div class="w-28 mt-2">
										<Button
											class="text-sm px-1 py-2"
											isLoading={runActive()}
											onClick={toggleRun}
										>
											Run Model
										</Button>
									</div>
								)}
								<div class="mx-6">
									<h4 class="font-semibold text-base mt-2">Epoch</h4>
									<div class="mt-2 mr-6">
										<div class="w-full bg-gray-300 overflow-hidden h-5 mb-6 rounded-lg">
											<div
												class="bg-blue-600 h-5 rounded-md"
												style={`width: ${runProgress().epochsCompletePercent}%`}
											></div>
										</div>
									</div>
									<h4 class="font-semibold text-base -mt-4">Items</h4>
									<div class="mt-2 mr-6">
										<div class="w-full bg-gray-300 overflow-hidden h-5 mb-6 rounded-lg">
											<div
												class="bg-blue-600 h-5 rounded-md"
												style={`width: ${runProgress().itemsCompletePercent}%`}
											></div>
										</div>
									</div>
								</div>
							</div>
							<div class="mx-4 my-2">
								<canvas ref={canvas}></canvas>
							</div>
							<div class="mt-6">
								<div class="sm:flex sm:items-center">
									<div class="sm:flex-auto">
										<h3 class="text-xl font-semibold text-gray-900">Runs</h3>
									</div>
									<div class="mt-4 mr-6 sm:mt-0 sm:ml-16 sm:flex-none">
										<Button variant="outline" onclick={() => setRunStats([])}>
											Clear
										</Button>
									</div>
								</div>
								<div class="mt-6 flex flex-col">
									<div class="overflow-x-auto mr-8">
										<div class="inline-block min-w-full max-h-[800px] align-middle">
											<div class="shadow ring-1 overflow-hidden ring-black ring-opacity-5 md:rounded-lg">
												<table class="min-w-full divide-y divide-gray-300">
													<thead class="bg-gray-50 sticky top-0">
														<tr class="divide-x divide-gray-200">
															<th
																scope="col"
																class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 sticky top-0"
															>
																Name
															</th>
															<th
																scope="col"
																class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 sticky top-0"
															>
																Avg Loss
															</th>
															<th
																scope="col"
																class="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 sticky top-0"
															>
																Accuracy
															</th>
														</tr>
													</thead>
													<tbody class="divide-y divide-gray-200 bg-white">
														{runs().map((run) => (
															<tr class="divide-x divide-gray-200">
																<td class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6">
																	{run.run_id}
																</td>
																<td class="whitespace-nowrap p-4 text-sm text-gray-500">
																	{round(run.loss_value, 4)}
																</td>
																<td class="whitespace-nowrap p-4 text-sm text-gray-500">
																	{round(run.accuracy * 100, 2)}%
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="rounded-lg shadow-sm bg-white w-1/3">
							<div class="border-b border-gray-200  px-4 py-5 sm:px-6">
								<div class="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
									<h3 class="ml-4 mt-2 text-lg font-semibold leading-6 text-gray-900">
										Server Log
									</h3>
									<div class="ml-4 mt-2 flex-shrink-0">
										<Button onclick={() => setMessages([])} variant="outline">
											Clear
										</Button>
									</div>
								</div>
							</div>
							<div class="px-4 py-5 text-sm max-h-[900px] flex flex-col overflow-scroll space-y-[1px]">
								{messages().length ? (
									messages().map((msg) => <div>{msg}</div>)
								) : (
									<div>None</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
