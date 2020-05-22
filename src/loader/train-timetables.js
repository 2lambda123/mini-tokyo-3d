import * as helpers from '../helpers';
import * as loaderHelpers from './helpers';

const CALENDARS = [
    'Weekday',
    'SaturdayHoliday'
];

const CALENDAR_POSTFIXES = [
    'weekday',
    'holiday'
];

const RAILWAYS_FOR_TRAINTIMETABLES = {
    tokyochallenge: [[
        'JR-East.Yamanote'
    ], [
        'JR-East.ChuoRapid'
    ], [
        'JR-East.Ome',
        'JR-East.Itsukaichi'
    ], [
        'JR-East.ChuoSobuLocal'
    ], [
        'JR-East.Tokaido',
        'JR-East.Utsunomiya',
        'JR-East.Takasaki'
    ], [
        'JR-East.KeihinTohokuNegishi'
    ], [
        'JR-East.JobanRapid',
        'JR-East.JobanLocal'
    ], [
        'JR-East.SobuRapid',
        'JR-East.Sobu',
        'JR-East.Narita',
        'JR-East.NaritaAirportBranch'
    ], [
        'JR-East.Uchibo',
        'JR-East.Sotobo'
    ], [
        'JR-East.Yokosuka',
        'JR-East.Keiyo'
    ], [
        'JR-East.SaikyoKawagoe',
        'JR-East.ShonanShinjuku',
        'JR-East.SotetsuDirect'
    ], [
        'JR-East.Tsurumi',
        'JR-East.TsurumiUmiShibauraBranch',
        'JR-East.TsurumiOkawaBranch',
        'JR-East.Nambu',
        'JR-East.NambuBranch'
    ], [
        'JR-East.Musashino',
        'JR-East.Yokohama',
        'TWR.Rinkai'
    ], [
        'TokyoMetro.Ginza'
    ], [
        'TokyoMetro.Marunouchi'
    ], [
        'TokyoMetro.MarunouchiBranch'
    ], [
        'TokyoMetro.Hibiya'
    ], [
        'TokyoMetro.Tozai'
    ], [
        'TokyoMetro.Chiyoda'
    ], [
        'TokyoMetro.Yurakucho'
    ], [
        'TokyoMetro.Hanzomon'
    ], [
        'TokyoMetro.Namboku',
        'TokyoMetro.Fukutoshin'
    ], [
        'Toei.Asakusa'
    ], [
        'Toei.Mita',
        'Toei.Shinjuku'
    ], [
        'Toei.Oedo',
        'Toei.NipporiToneri'
    ], [
        'YokohamaMunicipal.Blue',
        'YokohamaMunicipal.Green'
    ], [
        'Sotetsu.Main'
    ], [
        'Sotetsu.Izumino',
        'Sotetsu.JRDirect'
    ]],
    odpt: [[
        'MIR.TsukubaExpress',
        'TamaMonorail.TamaMonorail'
    ]]
};

const RAILWAY_YOKOSUKA = 'JR-East.Yokosuka',
    RAILWAY_SHONANSHINJUKU = 'JR-East.ShonanShinjuku',
    RAILWAY_YAMANOTEFREIGHT = 'JR-East.YamanoteFreight',
    RAILWAY_KEIYO = 'JR-East.Keiyo',
    RAILWAY_KEIYOKOYABRANCH = 'JR-East.KeiyoKoyaBranch',
    RAILWAY_KEIYOFUTAMATABRANCH = 'JR-East.KeiyoFutamataBranch',
    RAILWAY_MUSASHINO = 'JR-East.Musashino',
    RAILWAY_MUSASHINOKUNITACHIBRANCH = 'JR-East.MusashinoKunitachiBranch',
    RAILWAY_MUSASHINOOMIYABRANCH = 'JR-East.MusashinoOmiyaBranch',
    RAILWAY_MUSASHINONISHIURAWABRANCH = 'JR-East.MusashinoNishiUrawaBranch',
    RAILWAY_CHUORAPID = 'JR-East.ChuoRapid',
    RAILWAY_OEDO = 'Toei.Oedo';

const RAILWAYS_FOR_SOBURAPID = [
    'JR-East.NaritaAirportBranch',
    'JR-East.Narita',
    'JR-East.Sobu'
];

const RAIL_DIRECTION_OUTBOUND = 'Outbound',
    RAIL_DIRECTION_INBOUND = 'Inbound';

const TRAINTYPES_FOR_SOBURAPID = [
    'JR-East.Rapid',
    'JR-East.LimitedExpress'
];

const TRAINTYPE_FOR_YAMANOTEFREIGHT = 'JR-East.LimitedExpress';

const STATION_KEIYO_NISHIFUNABASHI = 'JR-East.Keiyo.NishiFunabashi',
    STATION_MUSASHINO_FUCHUHONMACHI = 'JR-East.Musashino.Fuchuhommachi',
    STATION_CHUORAPID_HACHIOJI = 'JR-East.ChuoRapid.Hachioji',
    STATION_OEDO_TOCHOMAE = 'Toei.Oedo.Tochomae',
    STATION_OEDO_SHINJUKUNISHIGUCHI = 'Toei.Oedo.ShinjukuNishiguchi';

export default async function(options) {

    return Promise.all(CALENDARS.map(async (calendar, i) => {
        const urls = [];

        Object.keys(RAILWAYS_FOR_TRAINTIMETABLES).forEach(source => {
            const {url, key} = options[source];
            RAILWAYS_FOR_TRAINTIMETABLES[source].forEach(railwayGroup => {
                const railways = railwayGroup
                    .map(railway => `odpt.Railway:${railway}`)
                    .join(',');

                urls.push(`${url}odpt:TrainTimetable?odpt:railway=${railways}&odpt:calendar=odpt.Calendar:${calendar}&acl:consumerKey=${key}`);
            });
        });

        const original = await Promise.all([
            ...urls,
            `data/timetable-${CALENDAR_POSTFIXES[i]}.json`
        ].map(loaderHelpers.loadJSON));

        const extra = original.pop();

        const data = [].concat(...original).map(timetable => ({
            t: helpers.removePrefix(timetable['odpt:train']),
            id: helpers.removePrefix(timetable['owl:sameAs']),
            r: helpers.removePrefix(timetable['odpt:railway']),
            y: helpers.removePrefix(timetable['odpt:trainType']),
            n: timetable['odpt:trainNumber'],
            os: helpers.removePrefix(timetable['odpt:originStation']),
            d: helpers.removePrefix(timetable['odpt:railDirection']),
            ds: helpers.removePrefix(timetable['odpt:destinationStation']),
            nt: helpers.removePrefix(timetable['odpt:nextTrainTimetable']),
            tt: timetable['odpt:trainTimetableObject'].map(obj => {
                const as = helpers.removePrefix(obj['odpt:arrivalStation']);
                const ds = helpers.removePrefix(obj['odpt:departureStation']);

                if (as && ds && as !== ds) {
                    console.log(`Error: ${as} != ${ds}`);
                }
                return helpers.cleanKeys({
                    a: obj['odpt:arrivalTime'],
                    d: obj['odpt:departureTime'],
                    s: as || ds
                });
            }),
            pt: helpers.removePrefix(timetable['odpt:previousTrainTimetable']),
            nm: timetable['odpt:trainName']
        }));

        const lookup = helpers.buildLookup(data);

        extra.forEach(timetable => {
            const {id, tt, pt, nt, nm, v} = timetable,
                timetableRef = lookup[id];

            if (!timetableRef) {
                if (tt) {
                    lookup[id] = timetable;
                    data.push(timetable);
                } else {
                    console.log('No connecting train', timetable);
                }
            } else {
                if (pt) {
                    timetableRef.pt = pt;
                }
                if (nt) {
                    timetableRef.nt = nt;
                }
                timetableRef.nm = nm;
                timetableRef.v = v;
            }
        });

        // Modify Sobu Rapid, Sobu, Narita and Narita Airport branch timetables
        RAILWAYS_FOR_SOBURAPID.forEach(railwayID => {
            data.filter(timetable =>
                timetable.r === railwayID && helpers.includes(TRAINTYPES_FOR_SOBURAPID, timetable.y)
            ).forEach(timetable => {
                const {id, tt, nt, pt} = timetable;
                let nextTable, prevTable;

                if (nt) {
                    nextTable = lookup[nt[0]];
                }
                if (pt) {
                    prevTable = lookup[pt[0]];
                }
                if (nextTable || prevTable) {
                    const r = (nextTable || prevTable).r;

                    tt.forEach(obj => {
                        obj.s = obj.s.replace(railwayID, r);
                    });
                }

                if (nextTable) {
                    const ntt = nextTable.tt;

                    if (!tt[tt.length - 1].d && !ntt[0].a) {
                        Object.assign(ntt[0], tt.pop());
                    }
                    ntt.splice(0, 0, ...tt);
                    delete nextTable.pt;
                } else if (prevTable) {
                    const ptt = prevTable.tt;

                    if (!tt[0].a && !ptt[ptt.length - 1].d) {
                        Object.assign(ptt[ptt.length - 1], tt.shift());
                    }
                    ptt.splice(ptt.length, 0, ...tt);
                    delete prevTable.nt;
                }
                data.splice(data.indexOf(timetable), 1);
                delete lookup[id];
            });
        });

        // Modify Yamanote Freight timetables
        data.filter(timetable =>
            timetable.r === RAILWAY_YOKOSUKA &&
            timetable.y === TRAINTYPE_FOR_YAMANOTEFREIGHT &&
            ((timetable.pt && timetable.pt[0].startsWith(RAILWAY_SHONANSHINJUKU)) ||
            (timetable.nt && timetable.nt[0].startsWith(RAILWAY_SHONANSHINJUKU)))
        ).forEach(timetable => {
            const {tt, nt, pt} = timetable;

            tt.forEach(obj => {
                obj.s = obj.s.replace(RAILWAY_YOKOSUKA, RAILWAY_YAMANOTEFREIGHT);
            });
            timetable.r = RAILWAY_YAMANOTEFREIGHT;
            if (pt && pt[0].startsWith(RAILWAY_SHONANSHINJUKU)) {
                const ptt = lookup[pt[0]].tt,
                    station = ptt[ptt.length - 1];

                tt.unshift({
                    d: station.d,
                    s: station.s.replace(RAILWAY_SHONANSHINJUKU, RAILWAY_YAMANOTEFREIGHT)
                });
                delete station.d;
            } else if (nt && nt[0].startsWith(RAILWAY_SHONANSHINJUKU)) {
                const ntt = lookup[nt[0]].tt,
                    station = ntt[0];

                tt.push({
                    a: station.a,
                    s: station.s.replace(RAILWAY_SHONANSHINJUKU, RAILWAY_YAMANOTEFREIGHT)
                });
                delete station.a;
            }
        });

        // Modify Keiyo branch timetables
        data.filter(timetable =>
            timetable.r === RAILWAY_KEIYO &&
            (timetable.tt[0].s === STATION_KEIYO_NISHIFUNABASHI ||
            timetable.tt[timetable.tt.length - 1].s === STATION_KEIYO_NISHIFUNABASHI)
        ).forEach(timetable => {
            const {tt, d: direction, os, ds} = timetable,
                startFromNishiFunabashi = tt[0].s === STATION_KEIYO_NISHIFUNABASHI,
                railwayID = timetable.r = (startFromNishiFunabashi && direction === RAIL_DIRECTION_OUTBOUND) ||
                    (!startFromNishiFunabashi && direction === RAIL_DIRECTION_INBOUND) ?
                    RAILWAY_KEIYOKOYABRANCH : RAILWAY_KEIYOFUTAMATABRANCH;

            [os, ds].forEach(stations => {
                stations.forEach((station, i) => {
                    stations[i] = station.replace(RAILWAY_KEIYO, railwayID);
                });
            });
            tt.forEach(obj => {
                obj.s = obj.s.replace(RAILWAY_KEIYO, railwayID);
            });
        });

        // Modify Musashino branch timeseries
        data.filter(timetable =>
            timetable.r === RAILWAY_MUSASHINO &&
            ((timetable.pt && timetable.pt[0].startsWith(RAILWAY_CHUORAPID)) ||
            (timetable.nt && timetable.nt[0].startsWith(RAILWAY_CHUORAPID)))
        ).forEach(timetable => {
            const {t, id, tt, nt, pt} = timetable,
                newTimetable = Object.assign({}, timetable);

            newTimetable.t = t.replace(RAILWAY_MUSASHINO, RAILWAY_MUSASHINOKUNITACHIBRANCH);
            newTimetable.id = id.replace(RAILWAY_MUSASHINO, RAILWAY_MUSASHINOKUNITACHIBRANCH);
            newTimetable.r = RAILWAY_MUSASHINOKUNITACHIBRANCH;

            if (pt && pt[0].startsWith(RAILWAY_CHUORAPID)) {
                const prevTable = lookup[pt[0]],
                    ptt = prevTable.tt,
                    station1 = ptt[ptt.length - 1],
                    station2 = tt[0];

                pt[0] = prevTable.nt[0] = newTimetable.id;
                newTimetable.pt = [prevTable.id];
                newTimetable.nt = [id];
                newTimetable.tt = [{
                    d: station1.d,
                    s: station1.s.replace(RAILWAY_CHUORAPID, RAILWAY_MUSASHINOKUNITACHIBRANCH)
                }, {
                    a: station2.a,
                    s: station2.s.replace(RAILWAY_MUSASHINO, RAILWAY_MUSASHINOKUNITACHIBRANCH)
                }];
                delete station1.d;
                delete station2.a;
            } else if (nt && nt[0].startsWith(RAILWAY_CHUORAPID)) {
                const nextTable = lookup[nt[0]],
                    ntt = nextTable.tt,
                    station1 = tt[tt.length - 1],
                    station2 = ntt[0];

                nt[0] = nextTable.pt[0] = newTimetable.id;
                newTimetable.pt = [id];
                newTimetable.nt = [nextTable.id];
                newTimetable.tt = [{
                    d: station1.d,
                    s: station1.s.replace(RAILWAY_MUSASHINO, RAILWAY_MUSASHINOKUNITACHIBRANCH)
                }, {
                    a: station2.a,
                    s: station2.s.replace(RAILWAY_CHUORAPID, RAILWAY_MUSASHINOKUNITACHIBRANCH)
                }];
                delete station1.d;
                delete station2.a;
            }
            data.push(newTimetable);
        });
        data.filter(timetable =>
            timetable.r === RAILWAY_SHONANSHINJUKU &&
            ((timetable.pt && timetable.pt[0].startsWith(RAILWAY_MUSASHINO)) ||
            (timetable.nt && timetable.nt[0].startsWith(RAILWAY_MUSASHINO)))
        ).forEach(timetable => {
            const {tt, os, ds, nt, pt} = timetable,
                railwayID = timetable.r = os[0] === STATION_MUSASHINO_FUCHUHONMACHI ||
                    os[0] === STATION_CHUORAPID_HACHIOJI ||
                    ds[0] === STATION_MUSASHINO_FUCHUHONMACHI ||
                    ds[0] === STATION_CHUORAPID_HACHIOJI ?
                    RAILWAY_MUSASHINOOMIYABRANCH : RAILWAY_MUSASHINONISHIURAWABRANCH;

            [os, ds].forEach(stations => {
                stations.forEach((station, i) => {
                    stations[i] = station.replace(RAILWAY_SHONANSHINJUKU, railwayID);
                });
            });
            tt.forEach(obj => {
                obj.s = obj.s.replace(RAILWAY_SHONANSHINJUKU, railwayID);
            });
            if (pt && pt[0].startsWith(RAILWAY_MUSASHINO)) {
                const prevTable = lookup[pt[0]],
                    ptt = prevTable.tt,
                    station = ptt[ptt.length - 1];

                if (ptt.length === 1) {
                    lookup[prevTable.pt[0]].nt = prevTable.nt;
                    timetable.pt = prevTable.pt;
                }
                tt.unshift({
                    d: station.d,
                    s: station.s.replace(RAILWAY_MUSASHINO, railwayID)
                });
                delete station.d;
            } else if (nt && nt[0].startsWith(RAILWAY_MUSASHINO)) {
                const nextTable = lookup[nt[0]],
                    ntt = nextTable.tt,
                    station = ntt[0];

                if (ntt.length === 1) {
                    timetable.nt = nextTable.nt;
                    lookup[nextTable.nt[0]].pt = nextTable.pt;
                }
                tt.push({
                    a: station.a,
                    s: station.s.replace(RAILWAY_MUSASHINO, railwayID)
                });
                delete station.a;
            }
        });

        // Modify Toei Oedo timetables
        data.filter(timetable =>
            timetable.r === RAILWAY_OEDO
        ).forEach(timetable => {
            const {tt} = timetable;

            tt.forEach((obj, i) => {
                const prev = tt[i - 1] || {},
                    next = tt[i + 1] || {};

                if (obj.s === STATION_OEDO_TOCHOMAE &&
                    prev.s !== STATION_OEDO_SHINJUKUNISHIGUCHI &&
                    next.s !== STATION_OEDO_SHINJUKUNISHIGUCHI) {
                    obj.s += '.1';
                }
            });
        });

        loaderHelpers.saveJSON(`build/data/timetable-${CALENDAR_POSTFIXES[i]}.json.gz`, data);

        console.log(`${calendar} train timetable data was loaded`);
    }));

}
