use super::ai_constants;
use super::constants;
use super::field_element::FieldElement;
use super::field_element::FieldObject;

pub const ELEMENT_SIZE: usize = (constants::MAP_WIDTH * constants::MAP_HEIGHT) as usize;

#[derive(Copy, Clone)]
pub struct Field {
    pub elements: [FieldElement; ELEMENT_SIZE],
}

impl Field {
    pub fn new() -> Field {
        let e = FieldElement::new(0, 0, FieldObject::None);
        let mut field = Field { elements: [e; ELEMENT_SIZE] };
        for i in 0..ELEMENT_SIZE {
            field.elements[i].x = i as i32 % constants::MAP_WIDTH;
            field.elements[i].y = i as i32 / constants::MAP_WIDTH;
        }
        field
    }

    pub fn from_data_array(walls: &[i32], power_up_items: &[i32], bombs: &[i32], explosions: &[i32]) -> Field {
        let mut field = Self::new();

        // 壁をマップに追加
        for wall in walls.iter() {
            let x = wall & 31;
            let y = (wall >> 5) & 31;
            let e = field.get_element_mut(x, y);
            e.field_object = if (wall & 0x10000) != 0 {
                FieldObject::BreakableWall
            } else {
                FieldObject::UnbreakableWall
            };
            e.will_broken = (wall & 0x20000) != 0;
        }
        // パワーアップアイテムをマップに追加
        for item in power_up_items.iter() {
            let x = item & 31;
            let y = (item >> 5) & 31;
            field.get_element_mut(x, y).field_object = FieldObject::PowerUpItem;
        }
        // 爆弾をマップに追加
        for bomb in bombs.iter() {
            let x = bomb & 31;
            let y = (bomb >> 5) & 31;
            let power = (bomb >> 10) & 255;
            let remain_time = (bomb >> 18) & 511;
            field.add_bomb(x, y, power, remain_time);
        }
        // 爆発を危険領域としてマップに追加
        for explosion in explosions.iter() {
            let x = explosion & 31;
            let y = (explosion >> 5) & 31;
            field.get_element_mut(x, y).risk = ai_constants::RISK_OF_EXPLOSION;
        }

        field
    }

    pub fn get_element(&self, x: i32, y: i32) -> &FieldElement {
        self.elements.get((y * constants::MAP_WIDTH + x) as usize).unwrap()
    }

    pub fn get_element_mut(&mut self, x: i32, y: i32) -> &mut FieldElement {
        self.elements.get_mut((y * constants::MAP_WIDTH + x) as usize).unwrap()
    }

    /// 指定位置からリスクのない場所へ移動できるか確認する
    pub fn check_if_escapable(&self, x: i32, y: i32, opponent_x: i32, opponent_y: i32) -> bool {
        let mut checked = [false; ELEMENT_SIZE];
        let mut search_queue = Vec::<&FieldElement>::new();
        search_queue.push(self.get_element(x, y));
        checked[(x + y * constants::MAP_WIDTH) as usize] = true;
        while !search_queue.is_empty() {
            let element = search_queue.remove(0);
            let ex = element.x;
            let ey = element.y;
            let next_elements = [
                self.get_element(ex - 1, ey),
                self.get_element(ex + 1, ey),
                self.get_element(ex, ey - 1),
                self.get_element(ex, ey + 1),
            ];
            for next_element in next_elements {
                let idx = (next_element.x + next_element.y * constants::MAP_WIDTH) as usize;
                if !checked[idx] && next_element.is_passable() {
                    if next_element.x != opponent_x || next_element.y != opponent_y {
                        if next_element.risk == 0 {
                            return true;
                        }
                        search_queue.push(next_element);
                        checked[idx] = true;
                    }
                }
            }
        }
        false
    }

    /// 爆弾を配置する
    pub fn add_bomb(&mut self, x: i32, y: i32, power: i32, remain_time: i32) -> i32 {
        let element = self.get_element_mut(x, y);
        element.field_object = FieldObject::Bomb;
        // この爆弾のリスク
        let risk = (constants::BOMB_TIME - remain_time) * (ai_constants::RISK_OF_BOMB * 9 / 10) / constants::BOMB_TIME + (ai_constants::RISK_OF_BOMB / 10);
        // リスクのセット
        element.risk = risk;
        let break_count = [(-1, 0), (1, 0), (0, -1), (0, 1)].iter().filter(|it|
            self.add_bomb_risk_to_field_map(x, y, power, risk, it.0, it.1)
        ).count();
        return break_count as i32
    }

    /// 爆弾が爆発したときのリスクを計算する
    fn add_bomb_risk_to_field_map(&mut self, x: i32, y: i32, power: i32, risk: i32, xx: i32, yy: i32) -> bool {
        for i in 1..(power + 1) {
            let px = x + xx * i;
            let py = y + yy * i;
            let field_element = self.get_element_mut(px, py);
            match field_element.field_object {
                FieldObject::BreakableWall => {
                    if !field_element.will_broken {
                        field_element.will_broken = true;
                        return true;
                    }
                }
                FieldObject::None => {
                    if risk > field_element.risk {
                        field_element.risk = risk;
                    }
                }
                _ => {
                    return false;
                }
            }
        }
        return false
    }
}