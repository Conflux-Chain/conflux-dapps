import Notifier from './index';

class MillisecondNotifier extends Notifier {
    public startIntervalCheck = () => {
        requestAnimationFrame(() => {
            this.checkWorkingUnits();
            if (this.status !== 'stop') {
                this.startIntervalCheck();
            }
        });
    }
}

const millisecondNotifier = new MillisecondNotifier();
export default millisecondNotifier;