import Notifier from './index';

const blobURL = URL.createObjectURL(
    new Blob(
        [
            '(',
            function () {
                let intervalId: number | null = null;
                const clearTimer = () => {
                    if (intervalId === null) return;
                    clearInterval(intervalId);
                    intervalId = null;
                };

                self.onmessage = function onMsgFunc(e) {
                    switch (e.data.command) {
                        case 'interval:start':
                            clearTimer();
                            intervalId = setInterval(function () {
                                postMessage({ message: 'interval:tick' });
                            }, 1000) as unknown as number;
                            break;
                        case 'interval:clear':
                            clearTimer();
                            break;
                    }
                };
            }.toString(),
            ')()',
        ],
        { type: 'application/javascript' }
    )
);

const worker = new Worker(blobURL);

URL.revokeObjectURL(blobURL);


class SecondNotifier extends Notifier {
    public startIntervalCheck = () => {
        this.checkWorkingUnits();
        worker.postMessage({ command: 'interval:start' });
        worker.onmessage = (evt) => {
            if (evt.data.message === 'interval:tick') {
                this.checkWorkingUnits();
                if (this.status === 'stop') {
                    worker.postMessage({ command: 'interval:clear' });
                }
            }
        }
    };
}

const secondNotifier = new SecondNotifier();

export default secondNotifier;
