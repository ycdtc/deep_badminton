// Player class definition
class Player {
    constructor(name, gender, level) {
        this.name = name;
        this.gender = gender;
        this.level = level;
        this.appearances = 0;  // 出场次数
        this.priority = 0;  // 出场优先级（较高的优先考虑）
        this.avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`;
    }
}

// 全局变量
let players = [
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

let haters = [new Set(["yc", "遥远"]), new Set(["老麦", "程程"])];
let goodPairs = [new Set(["老袁", "马大姐"])];
let totalAppearances = 8; // 每个选手的参赛次数

// 渲染选手列表
function renderPlayers() {
    const playersGrid = document.getElementById('playersGrid');
    playersGrid.innerHTML = ''; // 清空现有列表
    
    players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        playerCard.innerHTML = `
            <button class="delete-btn" onclick="deletePlayer(${index})">×</button>
            <img class="player-avatar" src="${player.avatar}" alt="${player.name}的头像">
            <div class="player-name">${index + 1}. ${player.name}</div>
            <span class="gender-badge ${player.gender === '男' ? 'gender-male' : 'gender-female'}">
                ${player.gender}
            </span>
            <span class="level-badge">等级: ${player.level}</span>
        `;
        
        playersGrid.appendChild(playerCard);
    });

    // 更新偏好设置中的选手选择框
    updatePlayerSelects();
}

// 添加新选手
function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const genderSelect = document.getElementById('playerGender');
    const levelInput = document.getElementById('playerLevel');
    
    const name = nameInput.value.trim();
    const gender = genderSelect.value;
    const level = parseFloat(levelInput.value);
    
    if (!name || !gender || isNaN(level)) {
        alert('请填写完整的选手信息！');
        return;
    }
    
    if (level < 1 || level > 6) {
        alert('等级必须在1-6之间！');
        return;
    }
    
    // 检查是否重名
    if (players.some(p => p.name === name)) {
        alert('已存在同名选手！');
        return;
    }
    
    // 添加新选手
    players.push(new Player(name, gender, level));
    
    // 清空表单
    nameInput.value = '';
    genderSelect.value = '男';
    levelInput.value = '';
    
    // 重新渲染列表
    renderPlayers();
}

// 删除选手
function deletePlayer(index) {
    if (confirm(`确定要删除选手 "${players[index].name}" 吗？`)) {
        const deletedPlayer = players[index];
        players.splice(index, 1);
        
        // 同时删除相关的配对
        haters = haters.filter(pair => !pair.has(deletedPlayer.name));
        goodPairs = goodPairs.filter(pair => !pair.has(deletedPlayer.name));
        
        renderPlayers();
        renderPairs();
    }
}

// 更新选手选择下拉框
function updatePlayerSelects() {
    const selects = ['hater1', 'hater2', 'good1', 'good2'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">选择选手</option>';
            players.forEach(player => {
                select.innerHTML += `<option value="${player.name}">${player.name}</option>`;
            });
        }
    });
}

// 渲染所有组合
function renderPairs() {
    renderHatersList();
    renderGoodPairsList();
}

// 渲染不期望组合列表
function renderHatersList() {
    const hatersList = document.getElementById('hatersList');
    hatersList.innerHTML = '';
    
    haters.forEach(pair => {
        const pairArray = Array.from(pair);
        const player1 = players.find(p => p.name === pairArray[0]);
        const player2 = players.find(p => p.name === pairArray[1]);
        
        if (player1 && player2) {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'pair-item';
            pairDiv.innerHTML = `
                <span class="pair-separator">🚫</span>
                <div class="player-pair">
                    <div class="player-avatars">
                        <img src="${getAvatarUrl(player1.name, player1.gender)}" alt="${player1.name}" class="player-avatar">
                        <img src="${getAvatarUrl(player2.name, player2.gender)}" alt="${player2.name}" class="player-avatar">
                    </div>
                    <span class="player-names">${player1.name}/${player2.name}</span>
                </div>
                <button class="remove-btn" onclick="removePairFromHaters(new Set(['${player1.name}', '${player2.name}']))">❌</button>
            `;
            hatersList.appendChild(pairDiv);
        }
    });
}

// 从不期望组合中移除一对
function removePairFromHaters(pair) {
    haters = haters.filter(p => 
        !setsEqual(p, pair)
    );
    renderHatersList();
}

// 比较两个Set是否相等
function setsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (let item of set1) {
        if (!set2.has(item)) return false;
    }
    return true;
}

// 渲染期望组合列表
function renderGoodPairsList() {
    const goodPairsList = document.getElementById('goodPairsList');
    goodPairsList.innerHTML = '';
    
    goodPairs.forEach(pair => {
        const pairArray = Array.from(pair);
        const player1 = players.find(p => p.name === pairArray[0]);
        const player2 = players.find(p => p.name === pairArray[1]);
        
        if (player1 && player2) {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'pair-item good-pair';
            pairDiv.innerHTML = `
                <span class="pair-separator">✨</span>
                <div class="player-pair">
                    <div class="player-avatars">
                        <img src="${getAvatarUrl(player1.name, player1.gender)}" alt="${player1.name}" class="player-avatar">
                        <img src="${getAvatarUrl(player2.name, player2.gender)}" alt="${player2.name}" class="player-avatar">
                    </div>
                    <span class="player-names">${player1.name}/${player2.name}</span>
                </div>
                <button class="remove-btn" onclick="removePairFromGoodPairs(new Set(['${player1.name}', '${player2.name}']))">❌</button>
            `;
            goodPairsList.appendChild(pairDiv);
        }
    });
}

// 从期望组合中移除一对
function removePairFromGoodPairs(pair) {
    goodPairs = goodPairs.filter(p => 
        !setsEqual(p, pair)
    );
    renderGoodPairsList();
}

// 添加不期望的组合
function addHaterPair() {
    const player1 = document.getElementById('hater1').value;
    const player2 = document.getElementById('hater2').value;
    
    if (!player1 || !player2 || player1 === player2) {
        alert('请选择两个不同的选手！');
        return;
    }
    
    // 检查是否已存在该组合
    if (haters.some(pair => pair.has(player1) && pair.has(player2))) {
        alert('该组合已存在！');
        return;
    }
    
    haters.push(new Set([player1, player2]));
    renderHatersList();
    
    // 清空选择
    document.getElementById('hater1').value = '';
    document.getElementById('hater2').value = '';
}

// 添加期望的组合
function addGoodPair() {
    const player1 = document.getElementById('good1').value;
    const player2 = document.getElementById('good2').value;
    
    if (!player1 || !player2 || player1 === player2) {
        alert('请选择两个不同的选手！');
        return;
    }
    
    // 检查是否已存在该组合
    if (goodPairs.some(pair => pair.has(player1) && pair.has(player2))) {
        alert('该组合已存在！');
        return;
    }
    
    goodPairs.push(new Set([player1, player2]));
    renderGoodPairsList();
    
    // 清空选择
    document.getElementById('good1').value = '';
    document.getElementById('good2').value = '';
}

// 删除组合
function deletePair(type, index) {
    if (type === 'hater') {
        haters.splice(index, 1);
        renderHatersList();
    } else {
        goodPairs.splice(index, 1);
        renderGoodPairsList();
    }
}

// 增加参赛次数
function increaseAppearances() {
    const input = document.getElementById('totalAppearances');
    const value = parseInt(input.value);
    if (value < 20) {
        input.value = value + 1;
        totalAppearances = value + 1;
    }
}

// 减少参赛次数
function decreaseAppearances() {
    const input = document.getElementById('totalAppearances');
    const value = parseInt(input.value);
    if (value > 1) {
        input.value = value - 1;
        totalAppearances = value - 1;
    }
}

// 切换偏好设置页面显示
function togglePreferences() {
    const mainPage = document.getElementById('mainPage');
    const preferencesPage = document.getElementById('preferencesPage');
    
    if (preferencesPage.style.display === 'none') {
        mainPage.style.display = 'none';
        preferencesPage.style.display = 'block';
        // 同步复选框状态
        document.getElementById('prefBalancedMode').checked = document.getElementById('balancedMode').checked;
        document.getElementById('prefTwoCourts').checked = document.getElementById('twoCourts').checked;
        document.getElementById('prefAvoidMixedGender').checked = document.getElementById('avoidMixedGender').checked;
        // 更新选手选择框
        updatePlayerSelects();
        // 渲染组合列表
        renderPairs();
    } else {
        mainPage.style.display = 'block';
        preferencesPage.style.display = 'none';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderPlayers();
    renderHatersList();
    renderGoodPairsList();
    updatePlayerSelects();
});

// 获取头像URL
function getAvatarUrl(name, gender) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`;
}

// 选择两名选手作为一队
function selectTeamPlayers(players) {
    if (players.length < 2) return null;
    
    const team = [];
    for (let i = 0; i < 2; i++) {
        const index = Math.floor(Math.random() * players.length);
        team.push(players[index]);
        players.splice(index, 1);
    }
    
    return team;
}

// 获取两名选手的组合键
function getTeamKey(player1, player2) {
    return `${player1.name},${player2.name}`;
}

// 获取两名选手的匹配键
function getMatchKey(player1, player2) {
    return `${player1.name} vs ${player2.name}`;
}

// 保存偏好设置并生成对阵
function savePreferences() {
    // 重置所有玩家的出场次数和优先级
    players.forEach(player => {
        player.appearances = 0;
        player.priority = 0;
    });
    
    // 生成对阵安排
    const matches = generateMatchups(players);
    
    // 隐藏偏好设置页面，显示对阵安排页面
    document.getElementById('preferencesPage').style.display = 'none';
    document.getElementById('matchupsPage').style.display = 'block';
    
    // 渲染对阵安排
    renderMatchups(matches);
}

// 开始匹配
function startMatching() {
    // 直接显示偏好设置页面
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('preferencesPage').style.display = 'block';
}

// 检查配对是否有效（避免男双对女双）
function validPairing(team1, team2) {
    const team1Males = team1.filter(p => p.gender === "男").length;
    const team1Females = team1.length - team1Males;
    const team2Males = team2.filter(p => p.gender === "男").length;
    const team2Females = team2.length - team2Males;

    if ((team1Males === 2 && team2Females === 2) || (team1Females === 2 && team2Males === 2)) {
        return false;
    }
    return true;
}

// 检查历史记录中的匹配次数
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

// 生成对阵安排
function generateMatchups(players) {
    players = players.slice();  // Create a copy of the players array
    players.sort(() => Math.random() - 0.5);  // Shuffle players
    const history = [];  // 记录历史对阵
    let index = 0;
    const matches = []; // 存储所有匹配结果

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

        // 存储本轮匹配结果
        const [[team1, team2], [team3, team4], diff] = bestMatch;
        matches.push({
            round: index,
            match: 2 * index - 1,
            team1: {
                players: team1,
                level: team1.reduce((sum, p) => sum + p.level, 0)
            },
            team2: {
                players: team2,
                level: team2.reduce((sum, p) => sum + p.level, 0)
            }
        });
        matches.push({
            round: index,
            match: 2 * index,
            team1: {
                players: team3,
                level: team3.reduce((sum, p) => sum + p.level, 0)
            },
            team2: {
                players: team4,
                level: team4.reduce((sum, p) => sum + p.level, 0)
            }
        });
    }

    console.log(matches);

    // 重置所有选手的出场次数（为下一次生成做准备）
    players.forEach(p => {
        p.appearances = 0;
    });

    return matches;
}

function renderMatchups(matches) {
    const container = document.getElementById('matchupsContainer');
    container.innerHTML = '';

    // 计算最大轮次
    const maxRound = Math.max(...matches.map(m => m.round));
    
    // 按轮次展示
    for (let round = 1; round <= maxRound; round++) {
        // 获取当前轮次的所有比赛
        const roundMatches = matches.filter(m => m.round === round)
            .sort((a, b) => a.match - b.match); // 按场次排序
        
        if (roundMatches.length > 0) {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round-container';
            
            const roundTitle = document.createElement('div');
            roundTitle.className = 'round-title';
            roundTitle.textContent = `第${round}轮`;
            roundDiv.appendChild(roundTitle);
            
            const matchesDiv = document.createElement('div');
            matchesDiv.className = 'matches-container';
            
            roundMatches.forEach((match) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match-item';
                
                // 比赛标题（第几场）
                const matchHeader = document.createElement('div');
                matchHeader.className = 'match-header';
                const matchNumber = document.createElement('div');
                matchNumber.className = 'match-number';
                matchNumber.textContent = `第${match.match}场`;
                matchHeader.appendChild(matchNumber);
                matchDiv.appendChild(matchHeader);
                
                // 比赛内容
                const matchContent = document.createElement('div');
                matchContent.className = 'match-content';
                
                // 左队
                const team1Container = document.createElement('div');
                team1Container.className = 'team-container';
                
                const team1Power = document.createElement('div');
                team1Power.className = 'team-power';
                team1Power.textContent = `战斗力: ${match.team1.level}`;
                team1Container.appendChild(team1Power);
                
                const team1Players = document.createElement('div');
                team1Players.className = 'team-players';
                
                // 头像行
                const team1Avatars = document.createElement('div');
                team1Avatars.className = 'player-avatars';
                match.team1.players.forEach(player => {
                    const img = document.createElement('img');
                    img.src = getAvatarUrl(player.name, player.gender);
                    img.alt = player.name;
                    team1Avatars.appendChild(img);
                });
                team1Players.appendChild(team1Avatars);
                
                // 名字行
                const team1Names = document.createElement('div');
                team1Names.className = 'player-names';
                match.team1.players.forEach(player => {
                    const span = document.createElement('span');
                    span.textContent = player.name;
                    team1Names.appendChild(span);
                });
                team1Players.appendChild(team1Names);
                
                team1Container.appendChild(team1Players);
                
                // 比分
                const scoreDiv = document.createElement('div');
                scoreDiv.className = 'match-score';
                scoreDiv.innerHTML = '0 <span>:</span> 0';
                
                // 右队
                const team2Container = document.createElement('div');
                team2Container.className = 'team-container';
                
                const team2Power = document.createElement('div');
                team2Power.className = 'team-power';
                team2Power.textContent = `战斗力: ${match.team2.level}`;
                team2Container.appendChild(team2Power);
                
                const team2Players = document.createElement('div');
                team2Players.className = 'team-players';
                
                // 头像行
                const team2Avatars = document.createElement('div');
                team2Avatars.className = 'player-avatars';
                match.team2.players.forEach(player => {
                    const img = document.createElement('img');
                    img.src = getAvatarUrl(player.name, player.gender);
                    img.alt = player.name;
                    team2Avatars.appendChild(img);
                });
                team2Players.appendChild(team2Avatars);
                
                // 名字行
                const team2Names = document.createElement('div');
                team2Names.className = 'player-names';
                match.team2.players.forEach(player => {
                    const span = document.createElement('span');
                    span.textContent = player.name;
                    team2Names.appendChild(span);
                });
                team2Players.appendChild(team2Names);
                
                team2Container.appendChild(team2Players);
                
                // 组装比赛内容
                matchContent.appendChild(team1Container);
                matchContent.appendChild(scoreDiv);
                matchContent.appendChild(team2Container);
                
                matchDiv.appendChild(matchContent);
                matchesDiv.appendChild(matchDiv);
            });
            
            roundDiv.appendChild(matchesDiv);
            container.appendChild(roundDiv);
        }
    }
}
