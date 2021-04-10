import express from 'express';
import asyncHandler from 'express-async-handler';
import * as schedule from '@controllers/report/schedule';

const router = express.Router();

const controllers = [
    { url: '/add', func: schedule.addSchedule },
    { url: '/delete', func: schedule.deleteSchedule },
    { url: '/enable', func: schedule.enableSchedule },
    { url: '/disable', func: schedule.disableSchedule },
    { url: '/get', func: schedule.getSchedule },
    { url: '/list', func: schedule.listSchedules },
    { url: '/stat', func: schedule.statSchedules }
];

controllers.forEach((config) => {
    router.post(config.url, asyncHandler(async (req, res) => {
        res.json(await config.func(req.body));
    }));
});

export default router;