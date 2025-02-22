class Player {
    constructor(name, gender, level) {
        this.name = name;
        this.gender = gender;
        this.level = level;
        this.appearances = 0;  // 出场次数
        this.priority = 0;  // 出场优先级（较高的优先考虑）
    }
}

// 选手列表（可以修改）
const players = [
    new Player("星星", "女", 3),
    new Player("老袁", "男", 5),
    new Player("yc", "男", 4),
    new Player("元元", "男", 4),
    new Player("panjoy", "男", 4),
    new Player("马大姐", "女", 4.5),
    new Player("cc", "男", 5.5),
    new Player("贾维斯", "男", 5.5),
    new Player("程程", "女", 4),
    new Player("遥远", "男", 3),
    new Player("老麦", "男", 5),
    new Player("vera", "女", 4)
];
const totalAppearances = 8;

const haters = [new Set(["yc", "遥远"]), new Set(["老麦", "程程"])];
const goodPairs = [new Set(["老袁", "马大姐"])];

function validPairing(team1, team2) {
    const team1Males = team1.filter(p => p.gender === "男").length;
    const team1Females = team1.length - team1Males;
    const team2Males = team2.filter(p => p.gender === "男").length;
    const team2Females = team2.length - team2Males;

    if ((team1Males === 2 && team2Females === 2) || (team1Females === 2 && team2Males === 2)) {
        return false;
    }
    return true;  // ❌ 禁止 2 男 vs 2 女
}

function matchInHistory(history, x) {
    const allPairs = [
        new Set([x[0][0][0].name, x[0][0][1].name]),
        new Set([x[0][1][0].name, x[0][1][1].name]),
        new Set([x[1][0][0].name, x[1][0][1].name]),
        new Set([x[1][1][0].name, x[1][1][1].name])
    ];
    let times = 0;
    for (const pairs of allPairs) {
        if (goodPairs.some(goodPair => goodPair.size === pairs.size && [...goodPair].every(value => pairs.has(value)))) {
            times -= 200;
        }
        if (haters.some(hater => hater.size === pairs.size && [...hater].every(value => pairs.has(value)))) {
            times += 200;
        }
        times += history.reduce((acc, past) => acc + (new Set(past).size === pairs.size && [...pairs].every(value => past.includes(value)) ? 1 : 0), 0);
    }
    return times;
}

function generateMatchups(players) {
    players = players.slice();  // Create a copy of the players array
    players.sort(() => Math.random() - 0.5);  // Shuffle players
    const history = [];  // 记录历史对阵
    let index = 0;

    while (players.some(p => p.appearances < totalAppearances)) {
        index += 1;
        // 按照 出场次数（少的优先） 和 优先级（上一场没打优先） 排序
        players.sort((a, b) => a.appearances - b.appearances || b.priority - a.priority);

        // 选择 8 名符合要求的选手
        const availablePlayers = players.filter(p => p.appearances < totalAppearances);
        const selectedPlayers = availablePlayers.slice(0, 8);

        // 更新选手的优先级和出场次数
        players.forEach(p => {
            if (selectedPlayers.includes(p)) {
                p.priority = -1;  // 本轮已出场
                p.appearances += 1;
            } else {
                p.priority += 1;  // 没出场的优先级增加
            }
        });

        // 组合所有可能的 (2+2) vs (2+2) 匹配方式
        const validMatches = [];
        for (let i = 0; i < selectedPlayers.length; i++) {
            for (let j = i + 1; j < selectedPlayers.length; j++) {
                const team1 = [selectedPlayers[i], selectedPlayers[j]];
                const remainingPlayers1 = selectedPlayers.filter(p => !team1.includes(p));
                for (let k = 0; k < remainingPlayers1.length; k++) {
                    for (let l = k + 1; l < remainingPlayers1.length; l++) {
                        const team2 = [remainingPlayers1[k], remainingPlayers1[l]];
                        const remainingPlayers2 = remainingPlayers1.filter(p => !team2.includes(p));
                        for (let m = 0; m < remainingPlayers2.length; m++) {
                            for (let n = m + 1; n < remainingPlayers2.length; n++) {
                                const team3 = [remainingPlayers2[m], remainingPlayers2[n]];
                                const team4 = remainingPlayers2.filter(p => !team3.includes(p));

                                // 确保性别匹配
                                if (validPairing(team1, team2) && validPairing(team3, team4)) {
                                    // 计算等级差
                                    const level1 = team1.reduce((sum, p) => sum + p.level, 0);
                                    const level2 = team2.reduce((sum, p) => sum + p.level, 0);
                                    const level3 = team3.reduce((sum, p) => sum + p.level, 0);
                                    const level4 = team4.reduce((sum, p) => sum + p.level, 0);
                                    const diff1 = Math.abs(level1 - level2);
                                    const diff2 = Math.abs(level3 - level4);
                                    if (diff1 <= 1 && diff2 <= 1) {
                                        // 记录匹配选项
                                        validMatches.push([[team1, team2], [team3, team4], diff1 + diff2]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 找到最优的匹配，尽量避免重复搭配
        validMatches.sort((a, b) => matchInHistory(history, a) - matchInHistory(history, b));

        // 选择最佳匹配
        const bestMatch = validMatches[0];
        history.push([bestMatch[0][0][0].name, bestMatch[0][0][1].name]);
        history.push([bestMatch[0][1][0].name, bestMatch[0][1][1].name]);
        history.push([bestMatch[1][0][0].name, bestMatch[1][0][1].name]);
        history.push([bestMatch[1][1][0].name, bestMatch[1][1][1].name]);

        // 输出本轮匹配
        const [[team1, team2], [team3, team4], diff] = bestMatch;
        console.log(` 第${index}轮对阵安排：`);
        console.log(`  ${2 * index - 1} 左队 (${team1.reduce((sum, p) => sum + p.level, 0)}) : ${team1.map(p => p.name).join(", ")} vs 右队 (${team2.reduce((sum, p) => sum + p.level, 0)}) : ${team2.map(p => p.name).join(", ")}`);
        console.log(`  ${2 * index} 左队 (${team3.reduce((sum, p) => sum + p.level, 0)}) : ${team3.map(p => p.name).join(", ")} vs 右队 (${team4.reduce((sum, p) => sum + p.level, 0)}) : ${team4.map(p => p.name).join(", ")}`);
        console.log("-".repeat(50));
    }
}

generateMatchups(players);
