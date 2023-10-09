// パワーアップアイテムのスコア
pub const SCORE_OF_POWER_UP_ITEM: i32 = 1000;

// 壁を壊すスコア
pub const SCORE_OF_BREAK_WALL: i32 = 30;

// 目的地までの移動距離のマイナススコア
pub const SCORE_OF_DISTANCE:i32 = 5;

// 爆発している場所のリスク値
pub const RISK_OF_EXPLOSION:i32 = 2000;

// 爆弾によっていずれ爆発する場所の最大リスク値
pub const RISK_OF_BOMB:i32 = 1000;

// 対戦相手のストレス度に対するスコアの重み
pub const OPPONENT_STRESS_WEIGHT:i32 = 10;

// 自分が爆弾設置後、対戦相手の現在位置を通過不能とみなす時間（フレーム数）
pub const OPPONENT_NOT_PASSABLE_TIMEOUT:i32 = 60;
